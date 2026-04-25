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
      $text = $text -replace '\s*【(五年级版|初三版|高三版|小学版|初中版|高中版|考场佳作|学生佳作|教师下水作文|下水作文|题\s*目|点\s*评|说明).*$', ''
      $text = $text -replace '\s*历年高考一类卷回看.*$', ''
      $text = $text.Trim('【', '】', ' ')
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
  if ($Title -match '有人说|也有人|还是|优于|更') { return '关系辩证题' }
  if ($Title -match '怎么看|认识和思考|谈谈你对') { return '价值判断题' }
  if ($Title -match '是否|是不是|吗？|吗\?|？|\?') { return '问题式命题' }
  return '材料作文'
}

function Get-ThemeTag {
  param([string]$Text)

  if (-not $Text) { return '综合思辨' }
  if ($Text -match 'AI|人工智能|互联网|短视频|传播|转发|流量|专业文章|通俗文章|传世文章|由.?专.?到.?传|专.?转.?传') { return '技术与传播' }
  if ($Text -match '自我|内心|主体|自由|个性|成长|真实|我是谁|断舍离|被需要|局限') { return '自我与成长' }
  if ($Text -match '价值|意义|有用|无用|代价|获益|成功|苦难|财富|目的|高下|认可度') { return '价值与意义' }
  if ($Text -match '责任|秩序|共识|对话|他人|道德|善良|共情|比较|期待|关系') { return '关系与责任' }
  if ($Text -match '文化|传统|中国味|世博|遗产|工匠|经典|阅读') { return '文化与时代' }
  if ($Text -match '知识|真理|逻辑|常识|结论|发问|好奇|探索|未知|想象|判断') { return '认知与判断' }
  return '生活现象与思辨'
}

function Get-CoreConceptText {
  param([string]$Text)

  $concepts = New-Object System.Collections.Generic.List[string]
  foreach ($match in [regex]::Matches($Text, '[“"''「『](.{1,12}?)[”"''」』]')) {
    $value = Compress-Whitespace $match.Groups[1].Value
    if ($value -and -not $concepts.Contains($value)) {
      $concepts.Add($value) | Out-Null
    }
  }

  foreach ($word in @('认可度', '好奇心', '断舍离', '有用', '无用', '专', '转', '传', '自由', '责任', '共识', '理解', '常识', '局限', '价值', '创新', '探索', '发问', '结论')) {
    if ($Text -like "*$word*" -and -not $concepts.Contains($word)) {
      $concepts.Add($word) | Out-Null
    }
  }

  if ($concepts.Count -gt 0) {
    return (($concepts | Select-Object -First 6) -join ' / ')
  }

  return '核心概念待人工圈画'
}

function Get-ThinkingTaskText {
  param(
    [string]$TopicType,
    [string]$ThemeTag
  )

  switch ($TopicType) {
    '问题式命题' { return '先回应设问，再说明成立条件、例外边界和现实意义，避免停在“是/否”表态。' }
    '关系辩证题' { return '先拆清两个概念的差异，再写二者如何互相限制、互相成全，最后落到平衡点。' }
    '价值判断题' { return '先判断该价值为何被需要，再指出误用风险，最后给出有条件的判断标准。' }
    '话题作文' { return '先限定话题边界，再选择一个可论证角度，避免泛泛抒情或素材堆砌。' }
    default { return '先找材料核心倾向，再把现象推进到原因、机制、边界和行动建议。' }
  }
}

function Get-StructureTemplateText {
  param([string]$TopicType)

  switch ($TopicType) {
    '问题式命题' {
      return @(
        '开头：拆设问，亮出“不是单线答案，而是条件判断”。',
        '主体一：解释题目判断为何有现实基础。',
        '主体二：补出反方或例外，说明绝对化会失真。',
        '主体三：提出更成熟的判断标准，并联系当下生活。',
        '结尾：回扣题眼，形成“条件-边界-实践”的闭环。'
      )
    }
    '关系辩证题' {
      return @(
        '开头：界定A与B，明确主次或互补关系。',
        '主体一：论证A的价值及其不可替代处。',
        '主体二：论证B的必要性，并指出A的局限。',
        '主体三：写二者如何统一，给出边界和平衡点。',
        '结尾：联系青年或时代，回到关系本身。'
      )
    }
    '价值判断题' {
      return @(
        '开头：指出流行判断背后的价值标准。',
        '主体一：说明该标准为什么有效。',
        '主体二：指出该标准何时会遮蔽真实问题。',
        '主体三：提出更可靠的判断尺度。',
        '结尾：把价值判断落到人的主体选择。'
      )
    }
    default {
      return @(
        '开头：从材料现象切入，压缩背景，迅速提出中心判断。',
        '主体一：解释现象产生的原因。',
        '主体二：分析现象背后的本质矛盾。',
        '主体三：提出解决路径或判断边界。',
        '结尾：回扣材料，完成现实升华。'
      )
    }
  }
}

function Get-TrainingActionText {
  param(
    [string]$TopicType,
    [string]$ThemeTag
  )

  return @(
    '用一句话写出中心论点，必须包含核心概念和关系判断。',
    '给每个主体段写一个“观点句 + 因果机制 + 回扣题眼”。',
    '至少补一个反例或边界条件，防止观点绝对化。',
    ('联系一个现实场景，优先选择“' + $ThemeTag + '”相关材料。')
  )
}

function Get-ShortNoteName {
  param([string]$Text)

  $name = Get-SafeNoteName $Text
  if ($name.Length -gt 18) {
    $name = $name.Substring(0, 18).Trim()
  }
  if (-not $name) {
    return '未命名'
  }
  return $name
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

function Get-ThemeNoteBaseName {
  param([string]$ThemeTag)

  return ('{0}-{1}' -f '母题', (Get-SafeNoteName $ThemeTag))
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
    [string]$ClusterNoteName,
    [string]$ThemeNoteName
  )

  $topic = Get-EntryTopic $Entry
  $fullPrompt = Get-FullPromptText $Entry
  $safeTitle = Get-SafeNoteName $topic
  $topicType = Get-TopicTypeTag ($topic + ' ' + $fullPrompt)
  $themeTag = Get-ThemeTag ($topic + ' ' + $fullPrompt)
  $coreConcepts = Get-CoreConceptText $topic
  $thinkingTask = Get-ThinkingTaskText -TopicType $topicType -ThemeTag $themeTag
  $structureTemplate = Get-StructureTemplateText -TopicType $topicType
  $trainingActions = Get-TrainingActionText -TopicType $topicType -ThemeTag $themeTag
  $tags = @(
    '上海作文',
    '范文库',
    ('来源/' + $Entry.packId),
    ('年份/' + ($Entry.yearLabel -replace '[^\d-]', '')),
    ('题型/' + $topicType),
    ('母题/' + $themeTag)
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
    ('theme: "' + $themeTag + '"'),
    ('core_concepts: "' + ($coreConcepts -replace '"', '\"') + '"'),
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
    $blocks.Add("### $sectionLabel`r`n$body")
  }

  $structureBlock = ($structureTemplate | ForEach-Object { '- ' + $_ }) -join "`r`n"
  $trainingBlock = ($trainingActions | ForEach-Object { '- [ ] ' + $_ }) -join "`r`n"

  $content = @(
    ($frontMatter -join "`r`n"),
    '',
    ('# ' + $topic),
    '',
    '## 0. 学习定位',
    ('| 项目 | 内容 |'),
    ('| --- | --- |'),
    ('| 题型 | ' + $topicType + ' |'),
    ('| 母题 | ' + $themeTag + ' |'),
    ('| 核心概念 | ' + $coreConcepts + ' |'),
    ('| 训练重点 | ' + $thinkingTask + ' |'),
    ('| 来源 | [[' + $PackNoteName + ']] / 第' + $Entry.order + '条 |'),
    '',
    '## 1. 审题抓手',
    ('- 先圈画：' + $coreConcepts),
    ('- 再判断：' + $thinkingTask),
    '- 防跑题：每个主体段都要回扣题目关键词，不要只讲故事或只喊口号。',
    '- 升格点：补出“成立条件、反面风险、现实场景”，让判断不是单薄表态。',
    '',
    '## 2. 可迁移结构',
    $structureBlock,
    '',
    '## 3. 训练动作',
    $trainingBlock,
    '',
    '## 4. 导航链接',
    ('- 来源文档：[[' + $PackNoteName + ']]'),
    ('- 题型导航：[[02-题型导航/' + $TypeNoteName + ']]'),
    ('- 母题导航：[[04-母题导航/' + $ThemeNoteName + ']]'),
    ('- 同题聚合：[[03-同题聚合/' + $ClusterNoteName + ']]'),
    '',
    '## 5. 原文资料',
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

  $guide = Get-ThinkingTaskText -TopicType $TopicType -ThemeTag '综合思辨'
  $themeRows = foreach ($themeGroup in ($Items | Group-Object themeTag | Sort-Object Name)) {
    $themeNote = Get-ThemeNoteBaseName $themeGroup.Name
    '- [[04-母题导航/{0}|{1}]]（{2}条）' -f $themeNote, $themeGroup.Name, $themeGroup.Count
  }
  $itemRows = foreach ($item in ($Items | Sort-Object yearLabel, packId, order)) {
    '- [[{0}|{1}]]（{2} / {3}）' -f $item.wikiPath, $item.title, $item.yearLabel, $item.themeTag
  }

  return @"
---
type: 题型导航
topic_type: "$TopicType"
---

# $TopicType

## 怎么练
- $guide
- 每次刷题先写 3 句：概念定义、关系判断、边界条件。
- 看范文时重点标出“转折句”和“回扣题眼句”。

## 统计
- 题目条目数：$($Items.Count)
- 唯一题目数：$(($Items | Group-Object topicKey).Count)

## 相关母题
$($themeRows -join "`r`n")

## 本题型条目
$($itemRows -join "`r`n")
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

## 使用方法
- 问题式命题：练“条件判断”和“边界意识”。
- 关系辩证题：练“概念拆分”和“对立统一”。
- 价值判断题：练“判断标准”和“现实校验”。
- 材料作文：练“抓材料倾向”和“从现象到本质”。

## 题型入口
$($rows -join "`r`n")
"@
}

function Build-ThemeOverviewMarkdown {
  param(
    [string]$ThemeTag,
    [object[]]$Items
  )

  $typeRows = foreach ($typeGroup in ($Items | Group-Object topicType | Sort-Object Name)) {
    $typeNote = Get-TypeNoteBaseName $typeGroup.Name
    '- [[02-题型导航/{0}|{1}]]（{2}条）' -f $typeNote, $typeGroup.Name, $typeGroup.Count
  }
  $itemRows = foreach ($item in ($Items | Sort-Object yearLabel, topicType, order)) {
    '- [[{0}|{1}]]（{2} / {3}）' -f $item.wikiPath, $item.title, $item.yearLabel, $item.topicType
  }

  return @"
---
type: 母题导航
theme: "$ThemeTag"
---

# $ThemeTag

## 学习目标
- 把同一母题下的题目放在一起，看它们如何从不同角度追问同一个问题。
- 训练时不要背范文，重点提炼“核心概念、关系判断、现实落点”。

## 题型分布
$($typeRows -join "`r`n")

## 题目清单
$($itemRows -join "`r`n")
"@
}

function Build-ThemeIndexMarkdown {
  param([object[]]$Items)

  $rows = foreach ($group in ($Items | Group-Object themeTag | Sort-Object Name)) {
    $themeNote = Get-ThemeNoteBaseName $group.Name
    $typeText = (($group.Group.topicType | Sort-Object -Unique) -join ' / ')
    '- [[{0}|{1}]]（{2}条；{3}）' -f ('04-母题导航/' + $themeNote), $group.Name, $group.Count, $typeText
  }

  return @"
# 母题导航总览

## 为什么要按母题整理
- 上海作文表面题目不同，底层常在考同一组能力：认知、价值、主体、关系、时代。
- 按母题复盘，可以避免“每道题都从零开始”，逐渐形成自己的思辨素材库。

## 母题入口
$($rows -join "`r`n")
"@
}

function Build-LearningPathMarkdown {
  param([object[]]$Items)

  $conceptRows = foreach ($item in ($Items | Where-Object { $_.topicType -in @('问题式命题', '价值判断题') } | Select-Object -First 12)) {
    '- [[{0}|{1}]]' -f $item.wikiPath, $item.title
  }
  $relationRows = foreach ($item in ($Items | Where-Object { $_.topicType -eq '关系辩证题' } | Select-Object -First 12)) {
    '- [[{0}|{1}]]' -f $item.wikiPath, $item.title
  }
  $realityRows = foreach ($item in ($Items | Where-Object { $_.themeTag -in @('技术与传播', '生活现象与思辨', '文化与时代') } | Select-Object -First 12)) {
    '- [[{0}|{1}]]' -f $item.wikiPath, $item.title
  }

  return @"
# 三阶段训练路径

## 第1阶段：概念辨析
目标：把题目关键词讲清楚，避免偷换概念。

动作：
- 用“不是……而是……”写出核心概念边界。
- 用一句话写中心论点，必须包含题眼。
- 看范文时只标“概念定义句”和“反面误解句”。

推荐题目：
$($conceptRows -join "`r`n")

## 第2阶段：分类讨论
目标：把同一现象下的不同心理、条件和结果分开写。

动作：
- 至少分出两类情况，不能只写单一路径。
- 每类都回答“为什么会这样”和“结果是什么”。
- 看范文时标出分类词：有些人、也有人、当……时。

推荐题目：
$($relationRows -join "`r`n")

## 第3阶段：现实关联
目标：让抽象判断落到社会生活和个人成长。

动作：
- 给每个观点配一个现实场景。
- 写出该观点能解决的现实矛盾。
- 结尾回到青年如何选择，而不是空喊口号。

推荐题目：
$($realityRows -join "`r`n")
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
- 00-首页：总入口，适合快速跳转。
- 00-来源文档：按原始资料包浏览，适合回看某一整份文档。
- 01-题目档案：一题一篇学习卡，适合精读和批注。
- 02-题型导航：按问题式、关系辩证、价值判断等题型刷题。
- 03-同题聚合：把同一道题在不同资料包里的讲评、范文、点评聚在一起。
- 04-母题导航：按认知、价值、主体、关系、时代等底层母题复盘。
- 05-训练路径：按“概念辨析 -> 分类讨论 -> 现实关联”逐步训练。

## 每篇笔记里有什么
- 学习定位：题型、母题、核心概念、训练重点。
- 审题抓手：先做什么、如何防跑题、怎样升格。
- 可迁移结构：把题目转换成可写的段落路线。
- 训练动作：直接变成下一次练习清单。
- 原文资料：保留题目、题解、范文、教师点评等原始内容。

## 推荐你在 Obsidian 里这样管理
- 给高频想复练的题手动补标签，例如 #高频母题、#还不会写、#可做晨读。
- 在每篇笔记末尾手动加一个“我的习作反思”小节，形成自己的备考痕迹。
- 刷题时先走 05-训练路径，不要一上来就看范文。
- 精读范文时只标三类句子：概念定义句、逻辑转折句、现实落点句。

## 这套库适合做什么
- 拆题：看同一类题目都在追问什么。
- 拆结构：看优秀范文的起承转合。
- 拆点评：看老师到底在表扬什么、提醒什么。
- 做训练闭环：题目阅读 -> 自己写 -> 回看范例 -> 记下自改任务。

## 给高中生的使用顺序
1. 先打开 05-训练路径，按阶段挑题。
2. 再打开对应题目的 01-题目档案，只看“审题抓手”和“可迁移结构”。
3. 自己写 10 分钟提纲或 25 分钟考场稿。
4. 最后再看原文资料和教师点评，记录一个具体错因。
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
$themeRoot = Join-Path $OutputRoot '04-母题导航'
$pathRoot = Join-Path $OutputRoot '05-训练路径'
$metaRoot = Join-Path $OutputRoot '_meta'

Ensure-Directory $OutputRoot
foreach ($generatedPath in @($buildRoot, $topicRoot, $packRoot, $typeRoot, $clusterRoot, $themeRoot, $pathRoot, $metaRoot)) {
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
Ensure-Directory $themeRoot
Ensure-Directory $pathRoot
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
    $fullPromptForTag = Get-FullPromptText $entry
    $topicType = Get-TopicTypeTag ($topic + ' ' + $fullPromptForTag)
    $themeTag = Get-ThemeTag ($topic + ' ' + $fullPromptForTag)
    $topicKey = Normalize-TopicKey $topic
    $typeNoteName = Get-TypeNoteBaseName $topicType
    $themeNoteName = Get-ThemeNoteBaseName $themeTag
    $clusterNoteName = Get-ClusterNoteBaseName $topic
    $rendered = Build-EntryMarkdown -Entry $entry -PackNoteName $packId -TypeNoteName $typeNoteName -ClusterNoteName $clusterNoteName -ThemeNoteName $themeNoteName
    $shortTitle = Get-ShortNoteName $rendered.title
    $noteName = ('{0:D2}-{1}-{2}.md' -f $entry.order, $topicType, $shortTitle)
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
      themeTag = $themeTag
      topicKey = $topicKey
      typeNoteName = $typeNoteName
      themeNoteName = $themeNoteName
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

foreach ($themeGroup in ($globalIndex | Group-Object themeTag | Sort-Object Name)) {
  $themeNoteName = Get-ThemeNoteBaseName $themeGroup.Name
  $themeNotePath = Join-Path $themeRoot ($themeNoteName + '.md')
  Set-Content -LiteralPath $themeNotePath -Value (Build-ThemeOverviewMarkdown -ThemeTag $themeGroup.Name -Items $themeGroup.Group) -Encoding UTF8
}

Set-Content -LiteralPath (Join-Path $themeRoot '00-母题总览.md') -Value (Build-ThemeIndexMarkdown -Items $globalIndex.ToArray()) -Encoding UTF8
Set-Content -LiteralPath (Join-Path $pathRoot '00-三阶段训练路径.md') -Value (Build-LearningPathMarkdown -Items $globalIndex.ToArray()) -Encoding UTF8

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
$indexLines.Add('> 这不是简单存范文的文件夹，而是给上海高考作文长期训练用的学习库。') | Out-Null
$indexLines.Add('') | Out-Null
$indexLines.Add('## 快速入口') | Out-Null
$indexLines.Add('- 使用说明见：[[99-使用说明]]') | Out-Null
$indexLines.Add('- 三阶段训练路径：[[05-训练路径/00-三阶段训练路径]]') | Out-Null
$indexLines.Add('- 题型入口见：[[02-题型导航/00-题型总览]]') | Out-Null
$indexLines.Add('- 母题入口见：[[04-母题导航/00-母题总览]]') | Out-Null
$indexLines.Add('- 同题聚合见：[[03-同题聚合/00-同题总览]]') | Out-Null
$indexLines.Add('') | Out-Null
$indexLines.Add('## 当前收录') | Out-Null
$indexLines.Add(('- 范文/题解条目：{0} 条' -f $globalIndex.Count)) | Out-Null
$indexLines.Add(('- 唯一题目：{0} 题' -f (($globalIndex | Group-Object topicKey).Count))) | Out-Null
$indexLines.Add(('- 题型数量：{0} 类' -f (($globalIndex | Group-Object topicType).Count))) | Out-Null
$indexLines.Add(('- 母题数量：{0} 类' -f (($globalIndex | Group-Object themeTag).Count))) | Out-Null
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
$indexLines.Add('## 按母题浏览') | Out-Null
foreach ($group in ($globalIndex | Group-Object themeTag | Sort-Object Name)) {
  $themeNoteName = Get-ThemeNoteBaseName $group.Name
  $indexLines.Add(('- [[04-母题导航/{0}|{1}]]（{2}条）' -f $themeNoteName, $group.Name, $group.Count)) | Out-Null
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

