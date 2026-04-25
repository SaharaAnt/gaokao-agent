param(
  [Parameter(Mandatory = $true)]
  [string[]]$SourceFiles,

  [string]$OutputRoot = '',

  [string]$ArchiveIndexPath = '',

  [switch]$KeepBuildFiles
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Ensure-Directory {
  param([string]$Path)

  if (-not (Test-Path -LiteralPath $Path)) {
    New-Item -ItemType Directory -Path $Path | Out-Null
  }
}

function Compress-Whitespace {
  param([string]$Text)

  return (($Text -replace '\s+', ' ').Trim())
}

function Get-YearLabel {
  param([string]$Text)

  $name = [System.IO.Path]::GetFileNameWithoutExtension($Text)
  $m = [regex]::Match($name, '(\d{2})(?:\D+)?(\d{2})')
  if ($m.Success) {
    return ('20{0}-20{1}' -f $m.Groups[1].Value, $m.Groups[2].Value)
  }

  $m = [regex]::Match($name, '(\d{2})')
  if ($m.Success) {
    return ('20{0}' -f $m.Groups[1].Value)
  }

  return '未标注年份'
}

function Get-ArchiveMap {
  param([string]$Path)

  if (-not $Path -or -not (Test-Path -LiteralPath $Path)) {
    return @{}
  }

  $raw = Get-Content -LiteralPath $Path -Raw -Encoding UTF8
  $items = $raw | ConvertFrom-Json
  $map = @{}
  foreach ($item in $items) {
    $map[$item.fileName] = $item
  }
  return $map
}

$script:MarkerDefinitions = @(
  [ordered]@{ Name = '作文题'; Patterns = @('【作文题目】', '【作文题】', '【春考作文题】', '【高考作文题】', '【作文原题】') },
  [ordered]@{ Name = '命题意图'; Patterns = @('【命题意图】', '命题人说', '命题者说') },
  [ordered]@{ Name = '题意解读'; Patterns = @('【题意解读】', '【题目解读】', '【题目解析】', '【试题分析】', '【试题解读】', '【作文解析】', '【命题解析】') },
  [ordered]@{ Name = '考场佳作'; Patterns = @('【考场佳作】', '【学生佳作】', '【教师下水作文】', '【下水作文】', '下水作文及互评') },
  [ordered]@{ Name = '主持人语'; Patterns = @('【主持人语】', '【本期主持】') },
  [ordered]@{ Name = '说明'; Patterns = @('【说明】', '【说\s*明】') },
  [ordered]@{ Name = '教师点评'; Patterns = @('教师点评：?', '老师评语：?', '教师互评：?') },
  [ordered]@{ Name = '关于写作'; Patterns = @('关于写作') },
  [ordered]@{ Name = '关于阅读'; Patterns = @('关于阅读') },
  [ordered]@{ Name = '复习建议'; Patterns = @('复习建议') },
  [ordered]@{ Name = '学段提示'; Patterns = @('【小\s*学】', '【初\s*中】', '【高\s*中】') }
)

function Get-MarkerMatch {
  param([string]$Line)

  foreach ($definition in $script:MarkerDefinitions) {
    foreach ($pattern in $definition.Patterns) {
      if ($Line -match ('^' + $pattern)) {
        return [ordered]@{
          Name = $definition.Name
          Pattern = $pattern
        }
      }
    }
  }

  return $null
}

function Expand-MarkerParagraphs {
  param([string]$Paragraph)

  $text = [string]$Paragraph
  if (-not $text) {
    return @()
  }

  $patterns = foreach ($definition in $script:MarkerDefinitions) {
    foreach ($pattern in $definition.Patterns) {
      $pattern
    }
  }

  foreach ($pattern in $patterns) {
    $text = [regex]::Replace($text, $pattern, {
      param($m)
      if ($m.Index -eq 0) { return $m.Value }
      return "`n$($m.Value)"
    })
  }

  return ($text -split "`r?`n" | ForEach-Object { $_.Trim() } | Where-Object { $_ })
}

function Get-MarkerName {
  param([string]$Line)

  $match = Get-MarkerMatch $Line
  if ($match) {
    return [string]$match.Name
  }

  return $null
}

function Strip-MarkerPrefix {
  param(
    [string]$Line,
    [string]$Marker
  )

  foreach ($definition in $script:MarkerDefinitions) {
    if ($definition.Name -ne $Marker) { continue }
    foreach ($pattern in $definition.Patterns) {
      if ($Line -match ('^' + $pattern)) {
        return ($Line -replace ('^' + $pattern), '').Trim('：', ':', ' ')
      }
    }
  }

  return $Line.Trim()
}

function New-Entry {
  param(
    [string]$PackId,
    [string]$PackTitle,
    [string]$FileName,
    [string]$YearLabel,
    [int]$Order
  )

  return [ordered]@{
    packId = $PackId
    packTitle = $PackTitle
    sourceFile = $FileName
    yearLabel = $YearLabel
    order = $Order
    segments = New-Object System.Collections.Generic.List[object]
  }
}

function Add-Segment {
  param(
    [hashtable]$Entry,
    [string]$Section,
    [string]$Text
  )

  $segment = [ordered]@{
    section = $Section
    lines = New-Object System.Collections.Generic.List[string]
  }
  if ($Text) {
    $segment.lines.Add($Text)
  }
  $Entry.segments.Add($segment) | Out-Null
}

function Add-LineToCurrentSegment {
  param(
    [hashtable]$Entry,
    [string]$Line
  )

  if ($Entry.segments.Count -eq 0) {
    Add-Segment -Entry $Entry -Section '补充内容' -Text $Line
    return
  }

  $Entry.segments[$Entry.segments.Count - 1].lines.Add($Line)
}

function Get-FullPromptText {
  param([hashtable]$Entry)

  $topicSegment = $Entry.segments | Where-Object { $_.section -eq '作文题' } | Select-Object -First 1
  if ($topicSegment) {
    $text = Compress-Whitespace ($topicSegment.lines -join ' ')
    if ($text) {
      return $text
    }
  }

  $firstUseful = $Entry.segments | Select-Object -First 1
  if ($firstUseful) {
    return (Compress-Whitespace ($firstUseful.lines -join ' '))
  }

  return ''
}

function Normalize-TopicTitle {
  param([string]$Text)

  $topic = Compress-Whitespace $Text
  if (-not $topic) {
    return ''
  }

  $topic = $topic -replace '^[（(]?\d+[）)\.、]\s*', ''
  $topic = $topic -replace '^阅读下面的材料，根据要求，写一篇[^。？！]*[。]?\s*', ''
  $topic = $topic -replace '\s*【[^】]+】.*$', ''
  $topic = $topic -replace '\s*要求[:：].*$', ''
  $topic = $topic -replace '\s*要求[（(].*$', ''

  if ($topic -match '^(?<main>.+?[？?])\s*(请写一篇|写一篇|对此|谈谈|要求[:：(（]).*$') {
    $topic = $Matches['main']
  } elseif ($topic -match '^(?<main>.+?[。])\s*(请写一篇|写一篇|要求[:：(（]).*$') {
    $topic = $Matches['main']
  } elseif ($topic -match '^(?<main>.+?)\s*请写一篇(文章|作文).*$') {
    $topic = $Matches['main']
  }

  $topic = Compress-Whitespace $topic
  $questionClip = [regex]::Match($topic, '^.{1,90}[？?]')
  if ($questionClip.Success) {
    return $questionClip.Value.Trim()
  }

  if ($topic.Length -gt 60) {
    $clip = [regex]::Match($topic, '^.{1,60}[？?。；;]')
    if ($clip.Success) {
      $topic = $clip.Value.Trim()
    } else {
      $topic = $topic.Substring(0, 60).Trim()
    }
  }

  return $topic
}

function Get-TopicTypeTag {
  param([string]$Title)

  if (-not $Title) { return '未分类题' }
  if ($Title -match '请以.+为话题') { return '话题作文' }
  if ($Title -match '是否|是不是|吗？|吗\?|？|\?') { return '问题式命题' }
  if ($Title -match '有人说|也有人|还是|优于|更') { return '关系辩证题' }
  if ($Title -match '怎么看|认识和思考|谈谈你对') { return '价值判断题' }
  return '材料作文'
}

function Normalize-TopicKey {
  param([string]$Title)

  $key = Compress-Whitespace $Title
  $key = $key -replace ',', '，'
  $key = $key -replace ':', '：'
  $key = $key -replace ';', '；'
  $key = $key -replace '\?', '？'
  $key = $key -replace '\(', '（'
  $key = $key -replace '\)', '）'
  $key = $key -replace '\s+', ''
  return $key.Trim()
}

function Get-HashSuffix {
  param([string]$Text)

  $bytes = [System.Text.Encoding]::UTF8.GetBytes($Text)
  $md5 = [System.Security.Cryptography.MD5]::Create()
  try {
    $hashBytes = $md5.ComputeHash($bytes)
  } finally {
    $md5.Dispose()
  }
  return ([System.BitConverter]::ToString($hashBytes).Replace('-', '').Substring(0, 8).ToLowerInvariant())
}

function Get-TypeNoteBaseName {
  param([string]$TopicType)

  return ('{0}-{1}' -f '题型', (Get-SafeNoteName $TopicType))
}

function Get-ClusterNoteBaseName {
  param([string]$Title)

  $safe = Get-SafeNoteName $Title
  if ($safe.Length -gt 28) {
    $safe = $safe.Substring(0, 28).Trim()
  }
  $hash = Get-HashSuffix (Normalize-TopicKey $Title)
  return ('{0}-{1}' -f $safe, $hash)
}

function Get-EntryTopic {
  param([hashtable]$Entry)

  $fullPrompt = Get-FullPromptText $Entry
  $topic = Normalize-TopicTitle $fullPrompt
  if ($topic) {
    return $topic
  }

  return ('未命名条目-{0:D2}' -f $Entry.order)
}

function Get-SafeNoteName {
  param([string]$Text)

  $name = ($Text -replace '[\\/:*?"<>|]', ' ').Trim()
  $name = Compress-Whitespace $name
  if ($name.Length -gt 42) {
    $name = $name.Substring(0, 42).Trim()
  }
  if (-not $name) {
    $name = '未命名条目'
  }
  return $name
}

function Get-DocParagraphs {
  param(
    [string]$SourcePath,
    [string]$BuildRoot
  )

  $name = [System.IO.Path]::GetFileNameWithoutExtension($SourcePath)
  $safe = Get-SafeNoteName $name
  $workDir = Join-Path $BuildRoot $safe
  Ensure-Directory $workDir

  $zipPath = Join-Path $workDir 'source.zip'
  $unzPath = Join-Path $workDir 'unz'

  Copy-Item -LiteralPath $SourcePath -Destination $zipPath -Force
  Expand-Archive -LiteralPath $zipPath -DestinationPath $unzPath -Force

  $docXmlPath = Join-Path $unzPath 'word\document.xml'
  $xml = [xml](Get-Content -LiteralPath $docXmlPath -Raw -Encoding UTF8)
  $ns = New-Object System.Xml.XmlNamespaceManager -ArgumentList $xml.NameTable
  $ns.AddNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main')

  $paragraphs = New-Object System.Collections.Generic.List[string]
  foreach ($p in $xml.SelectNodes('//w:body/w:p', $ns)) {
    $text = (($p.SelectNodes('.//w:t', $ns) | ForEach-Object { $_.InnerText }) -join '').Trim()
    if ($text) {
      foreach ($piece in Expand-MarkerParagraphs $text) {
        if ($piece) {
          $paragraphs.Add($piece)
        }
      }
    }
  }

  return $paragraphs.ToArray()
}

function Parse-DocEntries {
  param(
    [string[]]$Paragraphs,
    [string]$PackId,
    [string]$PackTitle,
    [string]$FileName,
    [string]$YearLabel
  )

  $entries = New-Object System.Collections.Generic.List[object]
  $preface = New-Object System.Collections.Generic.List[string]
  $current = $null
  $order = 0

  foreach ($line in $Paragraphs) {
    $marker = Get-MarkerName $line

    if (-not $current -and -not $marker) {
      $preface.Add($line)
      continue
    }

    if ($marker -eq '作文题') {
      if ($current) {
        $entries.Add($current) | Out-Null
      }
      $order += 1
      $current = New-Entry -PackId $PackId -PackTitle $PackTitle -FileName $FileName -YearLabel $YearLabel -Order $order
      $rest = Strip-MarkerPrefix -Line $line -Marker $marker
      Add-Segment -Entry $current -Section '作文题' -Text $rest
      continue
    }

    if (-not $current) {
      $preface.Add($line)
      continue
    }

    if ($marker) {
      $rest = Strip-MarkerPrefix -Line $line -Marker $marker
      Add-Segment -Entry $current -Section $marker -Text $rest
    } else {
      Add-LineToCurrentSegment -Entry $current -Line $line
    }
  }

  if ($current) {
    $entries.Add($current) | Out-Null
  }

  return [ordered]@{
    preface = $preface.ToArray()
    entries = $entries.ToArray()
  }
}

function Build-EntryMarkdown {
  param(
    [hashtable]$Entry,
    [string]$PackNoteName,
    [string]$TypeNoteName,
    [string]$ClusterNoteName
  )

  $topic = Get-EntryTopic $Entry
  $fullPrompt = Get-FullPromptText $Entry
  $safeTitle = Get-SafeNoteName $topic
  $topicType = Get-TopicTypeTag $topic
  $tags = @(
    '上海作文',
    '范文库',
    ('来源/' + $Entry.packId),
    ('年份/' + ($Entry.yearLabel -replace '[^\d-]', '')),
    ('题型/' + $topicType)
  )

  $frontMatter = @(
    '---',
    'type: 作文档案',
    ('source_pack: "' + $Entry.packTitle + '"'),
    ('source_file: "' + $Entry.sourceFile + '"'),
    ('year_label: "' + $Entry.yearLabel + '"'),
    ('entry_order: ' + $Entry.order),
    ('topic: "' + ($topic -replace '"', '\"') + '"'),
    ('prompt: "' + ($fullPrompt -replace '"', '\"') + '"'),
    ('topic_type: "' + $topicType + '"'),
    ('topic_key: "' + ((Normalize-TopicKey $topic) -replace '"', '\"') + '"'),
    'tags:'
  )
  $frontMatter += $tags | ForEach-Object { '  - ' + $_ }
  $frontMatter += '---'

  $sectionCounts = @{}
  $blocks = New-Object System.Collections.Generic.List[string]
  foreach ($segment in $Entry.segments) {
    $currentCount = 0
    if ($sectionCounts.Contains($segment.section)) {
      $currentCount = [int]$sectionCounts[$segment.section]
    }
    $sectionCounts[$segment.section] = $currentCount + 1
    $sectionLabel = if ($sectionCounts[$segment.section] -gt 1) { "$($segment.section) $($sectionCounts[$segment.section])" } else { $segment.section }
    $body = ($segment.lines | Where-Object { $_ } | ForEach-Object { $_.Trim() }) -join "`r`n`r`n"
    if (-not $body) {
      $body = '（原文该部分为空，待人工补录）'
    }
    $blocks.Add("## $sectionLabel`r`n$body")
  }

  $content = @(
    ($frontMatter -join "`r`n"),
    '',
    ('# ' + $topic),
    '',
    ('> 题型：' + $topicType),
    '',
    ('> 来源文档：[[' + $PackNoteName + ']]'),
    '',
    ('> 题型导航：[[02-题型导航/' + $TypeNoteName + ']]'),
    '',
    ('> 同题聚合：[[03-同题聚合/' + $ClusterNoteName + ']]'),
    '',
    ('> 条目序号：' + $Entry.order),
    '',
    ($blocks -join "`r`n`r`n")
  ) -join "`r`n"

  return [ordered]@{
    title = $topic
    safeTitle = $safeTitle
    content = $content
  }
}

function Build-TypeOverviewMarkdown {
  param(
    [string]$TopicType,
    [object[]]$Items
  )

  $clusterRows = foreach ($cluster in ($Items | Group-Object topicKey | Sort-Object Name)) {
    $canonicalTitle = ($cluster.Group | Sort-Object { $_.title.Length }, title | Select-Object -First 1).title
    $clusterNote = ($cluster.Group | Select-Object -First 1).clusterNoteName
    $yearText = (($cluster.Group.yearLabel | Sort-Object -Unique) -join ' / ')
    '- [[03-同题聚合/{0}|{1}]]（{2}篇；{3}）' -f $clusterNote, $canonicalTitle, $cluster.Count, $yearText
  }

  return @"
---
type: 题型导航
topic_type: "$TopicType"
---

# $TopicType

## 统计
- 题目条目数：$($Items.Count)
- 唯一题目数：$(($Items | Group-Object topicKey).Count)

## 同题聚合入口
$($clusterRows -join "`r`n")
"@
}

function Build-TypeIndexMarkdown {
  param([object[]]$Items)

  $rows = foreach ($group in ($Items | Group-Object topicType | Sort-Object Name)) {
    $typeNote = Get-TypeNoteBaseName $group.Name
    $clusterCount = ($group.Group | Group-Object topicKey).Count
    '- [[{0}|{1}]]（{2}条，{3}题）' -f ('02-题型导航/' + $typeNote), $group.Name, $group.Count, $clusterCount
  }

  return @"
# 题型导航总览

## 题型入口
$($rows -join "`r`n")
"@
}

function Build-ClusterMarkdown {
  param(
    [string]$CanonicalTitle,
    [object[]]$Items
  )

  $topicType = ($Items | Group-Object topicType | Sort-Object Count -Descending | Select-Object -First 1).Name
  $yearText = (($Items.yearLabel | Sort-Object -Unique) -join ' / ')
  $sourceText = (($Items.packTitle | Sort-Object -Unique) -join ' / ')
  $rows = foreach ($item in ($Items | Sort-Object yearLabel, packTitle, order)) {
    '- [[{0}|{1}]]（{2} / {3} / 第{4}条）' -f $item.wikiPath, $item.packTitle, $item.yearLabel, $item.sourceFile, $item.order
  }

  return @"
---
type: 同题聚合
topic: "$($CanonicalTitle -replace '"', '\"')"
topic_type: "$TopicType"
---

# $CanonicalTitle

## 聚合信息
- 题型：$TopicType
- 收录条目数：$($Items.Count)
- 涉及年份：$YearText
- 来源资料：$SourceText

## 对应原始笔记
$($rows -join "`r`n")
"@
}

function Build-ClusterIndexMarkdown {
  param([object[]]$Items)

  $duplicateRows = foreach ($group in (($Items | Group-Object topicKey | Where-Object { $_.Count -gt 1 }) | Sort-Object -Property @{ Expression = 'Count'; Descending = $true }, @{ Expression = 'Name'; Descending = $false })) {
    $canonicalTitle = ($group.Group | Sort-Object { $_.title.Length }, title | Select-Object -First 1).title
    $clusterNote = ($group.Group | Select-Object -First 1).clusterNoteName
    '- [[{0}|{1}]]（{2}篇）' -f ('03-同题聚合/' + $clusterNote), $canonicalTitle, $group.Count
  }

  if (-not $duplicateRows) {
    $duplicateRows = @('- 当前没有重复题目。')
  }

  return @"
# 同题聚合总览

## 聚合统计
- 总条目数：$($Items.Count)
- 唯一题目数：$(($Items | Group-Object topicKey).Count)
- 重复出现题目数：$(($Items | Group-Object topicKey | Where-Object { $_.Count -gt 1 }).Count)

## 重复出现的题目
$($duplicateRows -join "`r`n")
"@
}

function Build-PackOverviewMarkdown {
  param(
    [hashtable]$PackMeta,
    [object[]]$EntryIndex
  )

  $rows = if ($EntryIndex.Count -gt 0) {
    ($EntryIndex | ForEach-Object { "- [[{0}|{1}]]" -f $_.wikiPath, $_.title }) -join "`r`n"
  } else {
    '- 本文档暂未抽出作文条目。'
  }

  $preface = if ($PackMeta.preface.Count -gt 0) {
    ($PackMeta.preface | Select-Object -First 6 | ForEach-Object { "- $_" }) -join "`r`n"
  } else {
    '- 无单独前言。'
  }

  return @"
---
type: 来源档案
pack_id: "$($PackMeta.packId)"
source_file: "$($PackMeta.fileName)"
year_label: "$($PackMeta.yearLabel)"
---

# $($PackMeta.packTitle)

## 文档信息
- 来源文件：$($PackMeta.fileName)
- 年份范围：$($PackMeta.yearLabel)
- 抽出条目数：$($EntryIndex.Count)

## 文档前言摘录
$preface

## 本包作文条目
$rows
"@
}

function Build-VaultGuideMarkdown {
  return @'
# Obsidian 范文库使用说明

## 这套库怎么用
- 直接把 obsidian_vault 文件夹作为新的 Obsidian Vault 打开。
- 00-首页：总目录，适合按年份范围和来源文档总览。
- 00-来源文档：按原始资料包浏览，适合回看某一整份文档。
- 01-题目档案：一题一篇笔记，便于检索、加批注、做双向链接。
- 02-题型导航：横向看同类型题目，适合按题型刷题。
- 03-同题聚合：把同一道题在不同资料包里的讲评、范文、点评聚在一起。

## 每篇笔记里有什么
- 作文题：保留原始题目或题干。
- 题意解读 / 命题意图 / 试题分析：便于做审题训练。
- 考场佳作 / 教师下水作文：便于拆结构、看语言节奏。
- 教师点评：适合做“为什么这篇更值得学”的逆向学习。

## 推荐你在 Obsidian 里这样管理
- 给高频想复练的题手动补标签，例如 #高频母题、#还不会写、#可做晨读。
- 在每篇笔记末尾手动加一个 我的习作反思 小节，形成自己的备考痕迹。
- 可以再建自己的 MOC 导航页，比如 创新类题目、关系辩证题、价值判断题。

## 这套库适合做什么
- 拆题：看同一类题目都在追问什么。
- 拆结构：看优秀范文的起承转合。
- 拆点评：看老师到底在表扬什么、提醒什么。
- 做训练闭环：题目阅读 -> 自己写 -> 回看范例 -> 记下自改任务。
'@
}

if (-not $OutputRoot) {
  $OutputRoot = Join-Path (Split-Path -Parent $PSScriptRoot) 'obsidian_vault'
}
if (-not $ArchiveIndexPath) {
  $ArchiveIndexPath = Join-Path (Split-Path -Parent $PSScriptRoot) 'essay_archive\archive-index.json'
}

$OutputRoot = [System.IO.Path]::GetFullPath($OutputRoot)
$ArchiveIndexPath = [System.IO.Path]::GetFullPath($ArchiveIndexPath)
$buildRoot = Join-Path $OutputRoot '_build'
$topicRoot = Join-Path $OutputRoot '01-题目档案'
$packRoot = Join-Path $OutputRoot '00-来源文档'
$typeRoot = Join-Path $OutputRoot '02-题型导航'
$clusterRoot = Join-Path $OutputRoot '03-同题聚合'
$metaRoot = Join-Path $OutputRoot '_meta'

Ensure-Directory $OutputRoot
foreach ($generatedPath in @($buildRoot, $topicRoot, $packRoot, $typeRoot, $clusterRoot, $metaRoot)) {
  if (Test-Path -LiteralPath $generatedPath) {
    Remove-Item -LiteralPath $generatedPath -Recurse -Force
  }
}
foreach ($generatedFile in @((Join-Path $OutputRoot '00-首页.md'), (Join-Path $OutputRoot '99-使用说明.md'))) {
  if (Test-Path -LiteralPath $generatedFile) {
    Remove-Item -LiteralPath $generatedFile -Force
  }
}
Ensure-Directory $buildRoot
Ensure-Directory $topicRoot
Ensure-Directory $packRoot
Ensure-Directory $typeRoot
Ensure-Directory $clusterRoot
Ensure-Directory $metaRoot

$archiveMap = Get-ArchiveMap -Path $ArchiveIndexPath
$globalIndex = New-Object System.Collections.Generic.List[object]
$packSummaries = New-Object System.Collections.Generic.List[object]

foreach ($source in $SourceFiles) {
  if (-not (Test-Path -LiteralPath $source)) {
    throw "Source file not found: $source"
  }

  $fileName = [System.IO.Path]::GetFileName($source)
  $baseName = [System.IO.Path]::GetFileNameWithoutExtension($source)
  $archiveItem = $archiveMap[$fileName]
  $packId = if ($archiveItem) { [string]$archiveItem.id } else { Get-SafeNoteName $baseName }
  $packTitle = if ($archiveItem) { [string]$archiveItem.title } else { $baseName }
  $yearLabel = Get-YearLabel $baseName

  $paragraphs = Get-DocParagraphs -SourcePath $source -BuildRoot $buildRoot
  $parsed = Parse-DocEntries -Paragraphs $paragraphs -PackId $packId -PackTitle $packTitle -FileName $fileName -YearLabel $yearLabel

  $packFolder = Join-Path $topicRoot $packId
  Ensure-Directory $packFolder

  $entryItems = New-Object System.Collections.Generic.List[object]
  foreach ($entry in $parsed.entries) {
    $topic = Get-EntryTopic $entry
    $topicType = Get-TopicTypeTag $topic
    $topicKey = Normalize-TopicKey $topic
    $typeNoteName = Get-TypeNoteBaseName $topicType
    $clusterNoteName = Get-ClusterNoteBaseName $topic
    $rendered = Build-EntryMarkdown -Entry $entry -PackNoteName $packId -TypeNoteName $typeNoteName -ClusterNoteName $clusterNoteName
    $noteName = ('{0:D2}-{1}.md' -f $entry.order, $rendered.safeTitle)
    $notePath = Join-Path $packFolder $noteName
    Set-Content -LiteralPath $notePath -Value $rendered.content -Encoding UTF8

    $entryItem = [pscustomobject]@{
      packId = $packId
      packTitle = $packTitle
      yearLabel = $yearLabel
      title = $rendered.title
      notePath = $notePath
      wikiPath = ('01-题目档案/' + $packId + '/' + [System.IO.Path]::GetFileNameWithoutExtension($noteName))
      sourceFile = $fileName
      order = $entry.order
      topicType = $topicType
      topicKey = $topicKey
      typeNoteName = $typeNoteName
      clusterNoteName = $clusterNoteName
    }
    $entryItems.Add($entryItem) | Out-Null
    $globalIndex.Add($entryItem) | Out-Null
  }

  $packNotePath = Join-Path $packRoot ($packId + '.md')
  $packMeta = [ordered]@{
    packId = $packId
    packTitle = $packTitle
    fileName = $fileName
    yearLabel = $yearLabel
    preface = $parsed.preface
  }
  Set-Content -LiteralPath $packNotePath -Value (Build-PackOverviewMarkdown -PackMeta $packMeta -EntryIndex $entryItems.ToArray()) -Encoding UTF8

  $packSummaries.Add([pscustomobject]@{
    packId = $packId
    packTitle = $packTitle
    yearLabel = $yearLabel
    count = $entryItems.Count
  }) | Out-Null
}

foreach ($typeGroup in ($globalIndex | Group-Object topicType | Sort-Object Name)) {
  $typeNoteName = Get-TypeNoteBaseName $typeGroup.Name
  $typeNotePath = Join-Path $typeRoot ($typeNoteName + '.md')
  Set-Content -LiteralPath $typeNotePath -Value (Build-TypeOverviewMarkdown -TopicType $typeGroup.Name -Items $typeGroup.Group) -Encoding UTF8
}

Set-Content -LiteralPath (Join-Path $typeRoot '00-题型总览.md') -Value (Build-TypeIndexMarkdown -Items $globalIndex.ToArray()) -Encoding UTF8

foreach ($clusterGroup in ($globalIndex | Group-Object topicKey | Sort-Object Name)) {
  $clusterItems = $clusterGroup.Group
  $canonicalTitle = ($clusterItems | Sort-Object { $_.title.Length }, title | Select-Object -First 1).title
  $clusterNoteName = ($clusterItems | Select-Object -First 1).clusterNoteName
  $clusterNotePath = Join-Path $clusterRoot ($clusterNoteName + '.md')
  Set-Content -LiteralPath $clusterNotePath -Value (Build-ClusterMarkdown -CanonicalTitle $canonicalTitle -Items $clusterItems) -Encoding UTF8
}

Set-Content -LiteralPath (Join-Path $clusterRoot '00-同题总览.md') -Value (Build-ClusterIndexMarkdown -Items $globalIndex.ToArray()) -Encoding UTF8

$grouped = $globalIndex | Group-Object { $_.yearLabel }
$indexLines = New-Object System.Collections.Generic.List[string]
$indexLines.Add('# 上海作文范文库') | Out-Null
$indexLines.Add('') | Out-Null
$indexLines.Add('- 打开这个文件夹即可作为 Obsidian Vault 使用。') | Out-Null
$indexLines.Add('- 当前整理方式：一题一篇笔记，保留题目、题解、范文、教师点评。') | Out-Null
$indexLines.Add('- 使用说明见：[[99-使用说明]]') | Out-Null
$indexLines.Add('- 题型入口见：[[02-题型导航/00-题型总览]]') | Out-Null
$indexLines.Add('- 同题聚合见：[[03-同题聚合/00-同题总览]]') | Out-Null
$indexLines.Add('') | Out-Null
$indexLines.Add('## 按年份范围浏览') | Out-Null
foreach ($group in ($grouped | Sort-Object Name)) {
  $indexLines.Add('') | Out-Null
  $indexLines.Add("### $($group.Name)") | Out-Null
  foreach ($item in ($group.Group | Sort-Object packId, order)) {
    $indexLines.Add(('- [[{0}|{1}]]' -f $item.wikiPath, $item.title)) | Out-Null
  }
}
$indexLines.Add('') | Out-Null
$indexLines.Add('## 按题型浏览') | Out-Null
foreach ($group in ($globalIndex | Group-Object topicType | Sort-Object Name)) {
  $typeNoteName = Get-TypeNoteBaseName $group.Name
  $clusterCount = ($group.Group | Group-Object topicKey).Count
  $indexLines.Add(('- [[02-题型导航/{0}|{1}]]（{2}条，{3}题）' -f $typeNoteName, $group.Name, $group.Count, $clusterCount)) | Out-Null
}
$indexLines.Add('') | Out-Null
$indexLines.Add('## 同题聚合') | Out-Null
foreach ($group in (($globalIndex | Group-Object topicKey | Where-Object { $_.Count -gt 1 }) | Sort-Object -Property @{ Expression = 'Count'; Descending = $true }, @{ Expression = 'Name'; Descending = $false })) {
  $canonicalTitle = ($group.Group | Sort-Object { $_.title.Length }, title | Select-Object -First 1).title
  $clusterNoteName = ($group.Group | Select-Object -First 1).clusterNoteName
  $indexLines.Add(('- [[03-同题聚合/{0}|{1}]]（{2}篇）' -f $clusterNoteName, $canonicalTitle, $group.Count)) | Out-Null
}
$indexLines.Add('') | Out-Null
$indexLines.Add('## 来源文档') | Out-Null
foreach ($item in ($packSummaries | Sort-Object yearLabel, packId)) {
  $indexLines.Add(('- [[00-来源文档/{0}|{1}]]（{2}篇）' -f $item.packId, $item.packTitle, $item.count)) | Out-Null
}

Set-Content -LiteralPath (Join-Path $OutputRoot '00-首页.md') -Value ($indexLines -join "`r`n") -Encoding UTF8
Set-Content -LiteralPath (Join-Path $OutputRoot '99-使用说明.md') -Value (Build-VaultGuideMarkdown) -Encoding UTF8
$globalIndex | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $metaRoot 'obsidian-entry-index.json') -Encoding UTF8

if (-not $KeepBuildFiles) {
  if (Test-Path -LiteralPath $buildRoot) {
    Remove-Item -LiteralPath $buildRoot -Recurse -Force
  }
}

Write-Host ("Obsidian vault generated at: " + $OutputRoot)

