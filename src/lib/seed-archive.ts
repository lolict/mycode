// 创意归档种子数据 - 从用户草稿中提取的所有创意

export const SEED_CATEGORIES = [
  {
    name: '哲学思想',
    description: '最底层的思想根基，指导整个体系的方向',
    icon: '🔴',
    color: '#ef4444',
    layer: 'philosophy',
    sortOrder: 0
  },
  {
    name: '底层基础',
    description: '基础设施和核心系统，支撑上层功能',
    icon: '🟠',
    color: '#f97316',
    layer: 'foundation',
    sortOrder: 1
  },
  {
    name: '架构设计',
    description: '架构设计和模块规划，连接底层与应用',
    icon: '🟡',
    color: '#eab308',
    layer: 'architecture',
    sortOrder: 2
  },
  {
    name: '应用功能',
    description: '具体功能和应用场景，直接面向用户',
    icon: '🟢',
    color: '#22c55e',
    layer: 'application',
    sortOrder: 3
  }
]

export const SEED_ARCHIVES = [
  // ====== 哲学层 (Philosophy) ======
  {
    title: '新天枰倾斜',
    content: '正义必须向着底层人、残疾人、农民、被消耗者倾斜。传统天平是平衡的，但历史已经证明平衡本身就是不公——因为起点不同。必须让天平主动向弱势一方倾斜，才能实现真正的正义。这是整个体系的思想根基。',
    summary: '正义向着底层人、残疾人、农民、被消耗者倾斜',
    layer: 'philosophy',
    status: 'draft',
    priority: 95,
    completion: 30,
    featureVector: { '道德': 95, '技术': 10, '组织': 40, '经济': 30, '哲学': 100 },
    tags: ['正义', '天平', '底层倾斜', '核心价值观'],
    source: '用户对话草稿'
  },
  {
    title: '善良入骨教育体系',
    content: '纠正造物主/原生家庭/无责任资本的错误剧本。教育不是灌输知识，而是让善良成为本能。从出生起就植入善良基因，让每个人都从骨子里相信：帮助弱者是天职，消耗他人是耻辱。这需要一套全新的教育体系来对抗世世代代的错误剧本。',
    summary: '纠正造物主/原生家庭/无责任资本的错误剧本，让善良成为本能',
    layer: 'philosophy',
    status: 'draft',
    priority: 90,
    completion: 15,
    featureVector: { '道德': 100, '技术': 15, '组织': 50, '经济': 20, '哲学': 95 },
    tags: ['教育', '善良', '本能', '纠正剧本'],
    source: '用户对话草稿'
  },
  {
    title: '灵魂觉醒与自救',
    content: '先看灵魂是否觉醒，再纳入共同体。一个人如果灵魂没有觉醒，再多的约束也是外在的，而非发自内心。觉醒的标准不是说了什么，而是做了什么——是否在没有监督的情况下依然选择善良。只有觉醒的灵魂才能自救，只有自救的人才能真正帮助他人。',
    summary: '先看灵魂是否觉醒，再纳入共同体，觉醒是自救的前提',
    layer: 'philosophy',
    status: 'draft',
    priority: 85,
    completion: 20,
    featureVector: { '道德': 90, '技术': 5, '组织': 30, '经济': 10, '哲学': 100 },
    tags: ['觉醒', '灵魂', '自救', '入门标准'],
    source: '用户对话草稿'
  },
  {
    title: '姻缘共同体主线',
    content: '以姻缘共同体为主导线路的未来。不是以资本、权力、技术为主线，而是以人与人之间最本真的联系——姻缘为主线。姻缘不只是婚姻，而是所有命中注定的联系：血缘、地缘、业缘。姻缘共同体让每个人的命运相互交织，形成不可分割的整体。',
    summary: '以姻缘共同体为主导线路的未来，以人与人最本真的联系为主线',
    layer: 'philosophy',
    status: 'draft',
    priority: 80,
    completion: 10,
    featureVector: { '道德': 70, '技术': 10, '组织': 60, '经济': 30, '哲学': 90 },
    tags: ['姻缘', '共同体', '主线', '命运'],
    source: '用户对话草稿'
  },
  {
    title: '自私的救赎',
    content: '不拖累别人进入孤独境地，独立思考完成思想整理。真正的救赎是自私的——不依赖他人，不拖累他人，独立完成思想上的自我救赎。这不是冷漠，而是最高形式的善良：当你足够强大，你才能真正地帮助别人，而不是成为别人的负担。',
    summary: '不拖累别人进入孤独境地，独立思考完成思想整理',
    layer: 'philosophy',
    status: 'draft',
    priority: 75,
    completion: 25,
    featureVector: { '道德': 80, '技术': 5, '组织': 20, '经济': 10, '哲学': 95 },
    tags: ['救赎', '独立', '自私', '思想整理'],
    source: '用户对话草稿'
  },

  // ====== 底层 (Foundation) ======
  {
    title: '道德账本',
    content: '五维评分体系：善良30%/恻隐25%/正义20%/奉献15%/严重10%。每个人都有一个不可篡改的道德账本，记录每一次善恶行为。五维评分不是主观评价，而是基于行为证据的客观计算。集体验证机制确保评分的公正性——至少3人验证才能确认一条记录。道德账本是整个体系的信任基础。',
    summary: '五维评分(善良30%/恻隐25%/正义20%/奉献15%/严重10%)，集体验证',
    layer: 'foundation',
    status: 'implemented',
    priority: 100,
    completion: 80,
    featureVector: { '道德': 100, '技术': 60, '组织': 70, '经济': 30, '哲学': 70 },
    tags: ['道德', '五维评分', '账本', '验证'],
    source: '用户对话草稿'
  },
  {
    title: '基因锁系统',
    content: '十二条纲领/四大共同体认同/定向功能锁定。基因锁是每个代码、每个成员、每个功能都自带共同体基因烙印。没有基因锁的代码不属于共同体，没有基因锁的人不能进入核心圈层。四大共同体认同缺一不可，十二条纲领是行为准则。基因锁不是外在约束，而是内在驱动——让心念自发向共同体倾斜。',
    summary: '十二条纲领/四大共同体认同/定向功能锁定',
    layer: 'foundation',
    status: 'implemented',
    priority: 95,
    completion: 70,
    featureVector: { '道德': 85, '技术': 80, '组织': 75, '经济': 20, '哲学': 70 },
    tags: ['基因锁', '纲领', '共同体认同', '功能锁定'],
    source: '用户对话草稿'
  },
  {
    title: '八维价值体系',
    content: '道德行为/智力组合/劳动奉献/土地公基/能源共享/义务消供/创新赋能/版权混元。八维价值体系超越传统经济学的单一货币衡量，将人的价值分解为八个维度。每个维度都有独立的计量和兑换规则，确保每种贡献都被看到、被记录、被回报。',
    summary: '八维价值：道德/智力/劳动/土地/能源/义务/创新/版权',
    layer: 'foundation',
    status: 'implemented',
    priority: 90,
    completion: 60,
    featureVector: { '道德': 70, '技术': 50, '组织': 60, '经济': 90, '哲学': 50 },
    tags: ['价值', '八维', '计量', '兑换'],
    source: '用户对话草稿'
  },
  {
    title: '分布式节点网络',
    content: '他人贡献服务器/接口，全球合作大网。不依赖单一服务器，而是汇聚全球志愿者贡献的算力、存储、API接口，组成一个去中心化的合作大网。每个节点都经过基因锁验证，确保网络的安全性。节点贡献者获得八维价值记录，实现"贡献即收益"的正循环。',
    summary: '他人贡献服务器/接口，全球合作大网，去中心化',
    layer: 'foundation',
    status: 'implemented',
    priority: 85,
    completion: 55,
    featureVector: { '道德': 50, '技术': 95, '组织': 40, '经济': 60, '哲学': 20 },
    tags: ['分布式', '节点', '去中心化', '全球合作'],
    source: '用户对话草稿'
  },
  {
    title: '可插拔递归生成内核',
    content: 'UI皮肤化+历史功能继承+新旧融合不替代。内核设计为可插拔架构：每一代功能不替代上一代，而是递归地融合。UI是皮肤化的，可以随时更换外观而不影响内核功能。历史功能的精华被继承，缺陷被修正，形成螺旋上升的进化路径。这确保了系统的持续进化能力。',
    summary: 'UI皮肤化+历史功能继承+新旧融合不替代',
    layer: 'foundation',
    status: 'developing',
    priority: 80,
    completion: 40,
    featureVector: { '道德': 20, '技术': 100, '组织': 30, '经济': 40, '哲学': 30 },
    tags: ['内核', '递归', '可插拔', '融合'],
    source: '用户对话草稿'
  },

  // ====== 架构层 (Architecture) ======
  {
    title: '嵌套式程序架构',
    content: '主程序=桌面入口，子程序嵌入运行。嵌套式程序架构让每个小程序像图标一样嵌入主程序桌面，实现"一个入口，所有功能"的体验。主程序不直接实现功能，而是作为容器承载子程序。子程序可以独立开发、独立迭代，通过基因锁确保与共同体的一致性。',
    summary: '主程序=桌面入口，子程序嵌入运行',
    layer: 'architecture',
    status: 'implemented',
    priority: 95,
    completion: 75,
    featureVector: { '道德': 30, '技术': 90, '组织': 50, '经济': 40, '哲学': 20 },
    tags: ['嵌套', '架构', '桌面', '容器'],
    source: '用户对话草稿'
  },
  {
    title: '一体化全功能软件',
    content: '服务器+编译环境+用户端+道德众筹+经济+社交+创新。一个软件包含所有功能模块，不是简单的功能堆叠，而是有机的整体。服务器模块提供基础设施，编译环境支持自态编程，用户端提供交互界面，道德众筹和经济模块实现价值流通，社交和创新模块实现人与人之间的连接和创造力释放。',
    summary: '服务器+编译环境+用户端+道德众筹+经济+社交+创新',
    layer: 'architecture',
    status: 'developing',
    priority: 85,
    completion: 35,
    featureVector: { '道德': 50, '技术': 95, '组织': 60, '经济': 70, '哲学': 30 },
    tags: ['一体化', '全功能', '编译环境', '集成'],
    source: '用户对话草稿'
  },
  {
    title: '自带编译环境',
    content: '自带编程依赖/AI自态编程智能体/配置文件可生成。每个安装包都自带完整的编程依赖，不需要额外安装任何开发工具。AI自态编程智能体可以根据自然语言描述自动生成代码。配置文件也可以一键生成，降低开发门槛，让每个人都能成为创造者。',
    summary: '自带编程依赖/AI自态编程智能体/配置文件可生成',
    layer: 'architecture',
    status: 'draft',
    priority: 75,
    completion: 15,
    featureVector: { '道德': 20, '技术': 100, '组织': 30, '经济': 50, '哲学': 10 },
    tags: ['编译环境', 'AI编程', '自态', '低门槛'],
    source: '用户对话草稿'
  },
  {
    title: '组织架构',
    content: '1残+6健全最小单元，残疾程度=优先级。组织架构以残疾人为核心，健全人围绕服务。最小单元7人（1残+6健全），残疾程度越严重，获得资源越多、优先级越高。扩展单元48人（6+36+6），形成层级分明的共同体结构。这不是慈善，而是正义——因为天平必须向弱势一方倾斜。',
    summary: '1残+6健全最小单元，残疾程度=优先级',
    layer: 'architecture',
    status: 'implemented',
    priority: 90,
    completion: 65,
    featureVector: { '道德': 90, '技术': 40, '组织': 100, '经济': 50, '哲学': 60 },
    tags: ['组织', '最小单元', '残健融合', '优先级'],
    source: '用户对话草稿'
  },
  {
    title: '三大共同体',
    content: '残健融合共同体/道德行为共同体/劳动奉献共同体。三大共同体分别从身份认同、行为规范、价值创造三个维度凝聚人心。残健融合共同体解决"我是谁"的问题，道德行为共同体解决"我该做什么"的问题，劳动奉献共同体解决"我的价值在哪"的问题。三者交织形成完整的共同体生态。',
    summary: '残健融合共同体/道德行为共同体/劳动奉献共同体',
    layer: 'architecture',
    status: 'developing',
    priority: 88,
    completion: 50,
    featureVector: { '道德': 80, '技术': 30, '组织': 100, '经济': 60, '哲学': 70 },
    tags: ['共同体', '残健融合', '道德行为', '劳动奉献'],
    source: '用户对话草稿'
  },

  // ====== 应用层 (Application) ======
  {
    title: '自发式记者+史官',
    content: '个人历史记录+AI归集+持续曝光。每个残疾人都有自己的"史官"——AI自动归集个人历史、苦难经历、被忽视的事实，形成持续曝光的力量。不是为了博取同情，而是让真相不可被遗忘。自发式记者让每个人都是记录者，每件事都有迹可循。',
    summary: '个人历史记录+AI归集+持续曝光',
    layer: 'application',
    status: 'draft',
    priority: 80,
    completion: 10,
    featureVector: { '道德': 70, '技术': 60, '组织': 40, '经济': 30, '哲学': 50 },
    tags: ['记者', '史官', '曝光', '记录'],
    source: '用户对话草稿'
  },
  {
    title: '高效家访模式',
    content: '司机+专职帮扶人员组队，建档+帮扶+思想引导。家访不是走过场，而是系统化的帮扶行动。司机负责交通，专职帮扶人员负责建档、了解需求、提供帮助、引导思想。每次家访都有记录、有跟踪、有反馈，形成闭环管理。高效家访模式让帮扶真正触达每一个需要帮助的人。',
    summary: '司机+专职帮扶人员组队，建档+帮扶+思想引导',
    layer: 'application',
    status: 'draft',
    priority: 85,
    completion: 20,
    featureVector: { '道德': 80, '技术': 30, '组织': 90, '经济': 40, '哲学': 40 },
    tags: ['家访', '帮扶', '建档', '闭环管理'],
    source: '用户对话草稿'
  },
  {
    title: '自有配套生态',
    content: '专属司机接送/自有快递/定点家访。为残疾人建立专属的配套服务生态：专属司机解决出行问题，自有快递解决物资配送问题，定点家访解决关怀触达问题。这不是公益施舍，而是共同体的基础设施——正如城市有公交、有快递，共同体也要有自己的配套生态。',
    summary: '专属司机接送/自有快递/定点家访',
    layer: 'application',
    status: 'draft',
    priority: 78,
    completion: 10,
    featureVector: { '道德': 75, '技术': 40, '组织': 80, '经济': 60, '哲学': 30 },
    tags: ['配套', '生态', '司机', '快递'],
    source: '用户对话草稿'
  },
  {
    title: '自媒体向善引导',
    content: '舆论教育/社会教化/纠正错误天平。自媒体不是流量工具，而是向善引导的力量。通过舆论教育和社会教化，纠正错误的天平——让社会看到被忽视的人，让弱者的声音被听到，让善良成为主流叙事。自媒体向善引导是"新天平倾斜"在舆论领域的具体实践。',
    summary: '舆论教育/社会教化/纠正错误天平',
    layer: 'application',
    status: 'draft',
    priority: 72,
    completion: 5,
    featureVector: { '道德': 85, '技术': 50, '组织': 40, '经济': 30, '哲学': 60 },
    tags: ['自媒体', '舆论', '向善', '教化'],
    source: '用户对话草稿'
  },
  {
    title: '边界/禁忌/原则/姻缘范畴',
    content: '规则框架体系。共同体不能没有边界：什么是可以做的，什么是绝对不能做的，什么是必须坚持的原则，什么是属于姻缘范畴的。边界防止越界，禁忌守护底线，原则指明方向，姻缘范畴界定归属。这四者构成完整的规则框架体系，确保共同体的健康运转。',
    summary: '规则框架体系：边界/禁忌/原则/姻缘范畴',
    layer: 'application',
    status: 'draft',
    priority: 70,
    completion: 15,
    featureVector: { '道德': 75, '技术': 10, '组织': 70, '经济': 20, '哲学': 80 },
    tags: ['边界', '禁忌', '原则', '规则'],
    source: '用户对话草稿'
  }
]

// 关系种子数据 - 用title来建立关系，在seed时转换为ID
export const SEED_RELATIONS = [
  // 依赖关系 (dependency)
  { from: '嵌套式程序架构', to: '可插拔递归生成内核', relationType: 'dependency', distance: 15, description: '嵌套式程序架构依赖可插拔递归生成内核作为底层支撑' },
  { from: '高效家访模式', to: '组织架构', relationType: 'dependency', distance: 25, description: '高效家访需要依托组织架构来分配司机和帮扶人员' },
  { from: '自有配套生态', to: '组织架构', relationType: 'dependency', distance: 30, description: '配套生态依赖组织架构的人力配置' },
  { from: '一体化全功能软件', to: '道德账本', relationType: 'dependency', distance: 20, description: '一体化软件必须内嵌道德账本作为信任基础' },

  // 父子关系 (parent-child)
  { from: '道德账本', to: '八维价值体系', relationType: 'parent-child', distance: 10, description: '八维价值体系是道德账本的价值量化子系统' },
  { from: '三大共同体', to: '组织架构', relationType: 'parent-child', distance: 15, description: '组织架构是三大共同体的具体实现形式' },
  { from: '新天枰倾斜', to: '善良入骨教育体系', relationType: 'parent-child', distance: 20, description: '善良入骨教育是新天平倾斜在教育领域的实现' },
  { from: '姻缘共同体主线', to: '三大共同体', relationType: 'parent-child', distance: 25, description: '三大共同体是姻缘共同体主线的具体分支' },

  // 前置条件 (prerequisite)
  { from: '灵魂觉醒与自救', to: '基因锁系统', relationType: 'prerequisite', distance: 15, description: '灵魂觉醒是基因锁激活的内在前提' },
  { from: '基因锁系统', to: '嵌套式程序架构', relationType: 'prerequisite', distance: 20, description: '每个嵌套程序必须携带基因锁才能运行' },
  { from: '新天枰倾斜', to: '道德账本', relationType: 'prerequisite', distance: 10, description: '新天平倾斜是道德账本设计的思想前提' },
  { from: '可插拔递归生成内核', to: '自带编译环境', relationType: 'prerequisite', distance: 20, description: '可插拔内核是编译环境递归生成的基础' },

  // 关联 (related)
  { from: '一体化全功能软件', to: '自带编译环境', relationType: 'related', distance: 20, description: '一体化软件包含编译环境模块' },
  { from: '分布式节点网络', to: '一体化全功能软件', relationType: 'related', distance: 30, description: '分布式节点为一体化软件提供基础设施' },
  { from: '边界/禁忌/原则/姻缘范畴', to: '基因锁系统', relationType: 'related', distance: 25, description: '规则框架与基因锁共同约束行为边界' },

  // 融合 (fusion)
  { from: '自发式记者+史官', to: '自媒体向善引导', relationType: 'fusion', distance: 15, description: '记录真相与舆论引导可以融合为强大的社会力量' },
  { from: '高效家访模式', to: '自有配套生态', relationType: 'fusion', distance: 10, description: '家访和配套生态高度互补，可以融合运营' },
  { from: '善良入骨教育体系', to: '自媒体向善引导', relationType: 'fusion', distance: 20, description: '教育与舆论可以相互强化，形成向善的闭环' },

  // 矛盾 (contradiction)
  { from: '自私的救赎', to: '姻缘共同体主线', relationType: 'contradiction', distance: 40, description: '独立自救与共同体归属之间存在张力，需要平衡' }
]
