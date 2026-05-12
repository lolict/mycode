/**
 * 德系模块注册表 - 54个功能模块完整定义
 * 圆聚助残公益众筹平台 · 德系生态
 */

export interface DexiFormField {
  name: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'number' | 'date' | 'toggle'
  options?: string[]
  required?: boolean
  placeholder?: string
}

export interface DexiModuleDef {
  code: string
  name: string
  fullName: string
  category: string
  categoryLabel: string
  description: string
  icon: string        // lucide-react icon name
  color: string       // tailwind bg color class
  features: string[]
  status: 'active' | 'developing' | 'planned'
  priority: number
  formFields: DexiFormField[]
}

export interface DexiCategory {
  id: string
  name: string
  icon: string
  color: string
  description: string
}

export const DEXI_CATEGORIES: DexiCategory[] = [
  { id: 'infrastructure', name: '基础设施', icon: 'Building2', color: 'from-blue-500 to-cyan-500', description: '平台运行基石，数据存储与基础服务' },
  { id: 'transport', name: '出行物流', icon: 'Car', color: 'from-green-500 to-emerald-500', description: '无障碍出行与物流配送服务' },
  { id: 'finance', name: '经济金融', icon: 'Coins', color: 'from-yellow-500 to-orange-500', description: '公益经济与金融保障体系' },
  { id: 'medical', name: '医疗健康', icon: 'HeartPulse', color: 'from-red-500 to-pink-500', description: '医疗照护与健康管理服务' },
  { id: 'culture', name: '文化教育', icon: 'BookOpen', color: 'from-purple-500 to-violet-500', description: '文化传承与教育培训资源' },
  { id: 'governance', name: '治理监督', icon: 'Scale', color: 'from-indigo-500 to-blue-500', description: '公平治理与透明监督机制' },
  { id: 'emergency', name: '应急安全', icon: 'Siren', color: 'from-red-600 to-rose-600', description: '紧急救助与安全保障体系' },
  { id: 'social', name: '社交传播', icon: 'Megaphone', color: 'from-pink-500 to-fuchsia-500', description: '信息传播与社交联络网络' },
  { id: 'innovation', name: '创业赋能', icon: 'Rocket', color: 'from-cyan-500 to-teal-500', description: '创新创业与能力赋能支持' },
  { id: 'records', name: '记录存档', icon: 'Archive', color: 'from-gray-500 to-slate-500', description: '数据记录与档案管理系统' },
]

export const DEXI_MODULES: DexiModuleDef[] = [
  // ===== 🏗️ 基础设施类 (infrastructure) =====
  {
    code: 'deqi', name: '德器', fullName: '德器·辅具管理',
    category: 'infrastructure', categoryLabel: '基础设施',
    description: '辅助器具登记、借用、维修、适配全生命周期管理，实现辅具资源的最优配置与循环利用',
    icon: 'Wrench', color: 'bg-blue-500',
    features: ['辅具登记', '借用管理', '维修记录', '适配评估'],
    status: 'active', priority: 10,
    formFields: [
      { name: 'itemName', label: '器具名称', type: 'text', required: true, placeholder: '如：轮椅、助听器、盲杖' },
      { name: 'itemType', label: '器具类型', type: 'select', options: ['行动辅具', '感官辅具', '生活辅具', '沟通辅具', '学习辅具'], required: true },
      { name: 'status', label: '器具状态', type: 'select', options: ['可用', '借用中', '维修中', '报废'], required: true },
      { name: 'location', label: '存放位置', type: 'text', placeholder: '详细存放地址' },
      { name: 'condition', label: '完好程度', type: 'select', options: ['全新', '良好', '一般', '需维修'] },
      { name: 'notes', label: '备注', type: 'textarea', placeholder: '使用说明、注意事项等' },
    ]
  },
  {
    code: 'deyun', name: '德运', fullName: '德运·运营管理',
    category: 'infrastructure', categoryLabel: '基础设施',
    description: '平台运营数据分析、用户行为洞察、系统配置管理，保障平台高效稳定运行',
    icon: 'Settings', color: 'bg-cyan-500',
    features: ['运营数据', '用户管理', '系统配置', '性能监控'],
    status: 'active', priority: 11,
    formFields: [
      { name: 'metricName', label: '指标名称', type: 'text', required: true, placeholder: '运营指标' },
      { name: 'metricType', label: '指标类型', type: 'select', options: ['用户活跃度', '项目完成率', '资金流转', '服务满意度'], required: true },
      { name: 'metricValue', label: '指标数值', type: 'number', required: true },
      { name: 'period', label: '统计周期', type: 'select', options: ['日', '周', '月', '季度', '年度'] },
      { name: 'analysis', label: '分析说明', type: 'textarea', placeholder: '指标趋势分析与优化建议' },
    ]
  },
  {
    code: 'dechu', name: '德储', fullName: '德储·储蓄管理',
    category: 'infrastructure', categoryLabel: '基础设施',
    description: '残健共同体储蓄池管理、利息分配机制、资金流转追踪，实现互助储蓄的透明化管理',
    icon: 'PiggyBank', color: 'bg-teal-500',
    features: ['储蓄池', '利息分配', '资金流转', '到期管理'],
    status: 'active', priority: 12,
    formFields: [
      { name: 'savingsType', label: '储蓄类型', type: 'select', options: ['个人储蓄', '互助池', '专项基金', '应急储备'], required: true },
      { name: 'amount', label: '金额', type: 'number', required: true },
      { name: 'term', label: '储蓄期限', type: 'select', options: ['活期', '3个月', '6个月', '1年', '3年'] },
      { name: 'interestRate', label: '利率(%)', type: 'number', placeholder: '年化利率' },
      { name: 'purpose', label: '用途说明', type: 'textarea', placeholder: '储蓄目的与使用计划' },
    ]
  },
  {
    code: 'deyuncloud', name: '德云', fullName: '德云·云端服务',
    category: 'infrastructure', categoryLabel: '基础设施',
    description: '分布式数据存储、云端备份恢复、多节点同步与容灾保障，构建去中心化的数据安全体系',
    icon: 'Cloud', color: 'bg-sky-500',
    features: ['云存储', '数据备份', '节点同步', '容灾恢复'],
    status: 'developing', priority: 13,
    formFields: [
      { name: 'serviceType', label: '服务类型', type: 'select', options: ['数据备份', '节点同步', '容灾恢复', '数据迁移'], required: true },
      { name: 'dataType', label: '数据类型', type: 'select', options: ['用户数据', '项目数据', '账本数据', '系统日志'] },
      { name: 'nodeCount', label: '同步节点数', type: 'number', placeholder: '分布式节点数量' },
      { name: 'syncStatus', label: '同步状态', type: 'select', options: ['已同步', '同步中', '待同步', '同步失败'] },
      { name: 'details', label: '详细信息', type: 'textarea', placeholder: '服务详情与操作记录' },
    ]
  },
  {
    code: 'dejian', name: '德建', fullName: '德建·基建工程',
    category: 'infrastructure', categoryLabel: '基础设施',
    description: '无障碍设施建设规划、乡村道路改造工程、公共设施无障碍升级，推动包容性环境建设',
    icon: 'Building2', color: 'bg-slate-500',
    features: ['无障碍建设', '道路改造', '设施规划', '工程监理'],
    status: 'active', priority: 14,
    formFields: [
      { name: 'projectName', label: '工程名称', type: 'text', required: true, placeholder: '如：村道无障碍改造工程' },
      { name: 'projectType', label: '工程类型', type: 'select', options: ['无障碍通道', '坡道改造', '扶手安装', '卫生间改造', '电梯安装', '盲道铺设'], required: true },
      { name: 'location', label: '工程地点', type: 'text', required: true },
      { name: 'budget', label: '预算金额', type: 'number' },
      { name: 'progress', label: '工程进度(%)', type: 'number', placeholder: '0-100' },
      { name: 'description', label: '工程说明', type: 'textarea', placeholder: '工程详细描述与进度说明' },
    ]
  },
  {
    code: 'dezhuang', name: '德装', fullName: '德装·适配装修',
    category: 'infrastructure', categoryLabel: '基础设施',
    description: '残疾人家庭无障碍装修设计、生活环境适配改造、智能家居辅助安装，提升居家生活品质',
    icon: 'PaintBucket', color: 'bg-indigo-500',
    features: ['无障碍装修', '环境适配', '智能家居', '辅具安装'],
    status: 'active', priority: 15,
    formFields: [
      { name: 'renovationType', label: '装修类型', type: 'select', options: ['卫生间改造', '厨房改造', '入户通道', '全屋适配', '智能设备安装'], required: true },
      { name: 'disabilityType', label: '适配残疾类型', type: 'select', options: ['肢体残疾', '视力残疾', '听力残疾', '言语残疾', '智力残疾', '精神残疾', '多重残疾'] },
      { name: 'area', label: '改造面积(㎡)', type: 'number' },
      { name: 'budget', label: '预算金额', type: 'number' },
      { name: 'address', label: '装修地址', type: 'text', required: true },
      { name: 'requirements', label: '具体需求', type: 'textarea', placeholder: '详细描述无障碍改造需求' },
    ]
  },

  // ===== 🚗 出行物流类 (transport) =====
  {
    code: 'dedi', name: '递', fullName: '德递·物流快递',
    category: 'transport', categoryLabel: '出行物流',
    description: '无障碍快递配送、残障友好物流服务、上门取件与助残优惠，打通最后一公里配送障碍',
    icon: 'Truck', color: 'bg-green-500',
    features: ['无障碍快递', '上门取件', '助残优惠', '物流追踪'],
    status: 'active', priority: 20,
    formFields: [
      { name: 'serviceType', label: '服务类型', type: 'select', options: ['寄送快递', '上门取件', '大件配送', '药品配送'], required: true },
      { name: 'pickupAddress', label: '取件地址', type: 'text', required: true },
      { name: 'deliveryAddress', label: '收件地址', type: 'text', required: true },
      { name: 'itemDesc', label: '物品描述', type: 'textarea', placeholder: '物品名称、数量、特殊要求' },
      { name: 'isUrgent', label: '是否加急', type: 'toggle' },
      { name: 'assistanceNeeded', label: '需要搬运协助', type: 'toggle' },
    ]
  },
  {
    code: 'dejia', name: '德驾', fullName: '德驾·出行驾驶',
    category: 'transport', categoryLabel: '出行物流',
    description: '无障碍出行服务、代驾助残专车、无障碍车辆调度与路线规划，保障残障人士出行自由',
    icon: 'Car', color: 'bg-emerald-500',
    features: ['无障碍出行', '代驾服务', '助残专车', '路线规划'],
    status: 'active', priority: 21,
    formFields: [
      { name: 'tripType', label: '出行类型', type: 'select', options: ['日常出行', '就医出行', '办事出行', '长途出行'], required: true },
      { name: 'pickupLocation', label: '出发地', type: 'text', required: true },
      { name: 'destination', label: '目的地', type: 'text', required: true },
      { name: 'scheduledTime', label: '预约时间', type: 'date' },
      { name: 'vehicleType', label: '车辆类型', type: 'select', options: ['轮椅可入', '盲人导乘', '普通代驾', '急救车辆'] },
      { name: 'specialNeeds', label: '特殊需求', type: 'textarea', placeholder: '出行中的特殊需求' },
    ]
  },
  {
    code: 'dehang', name: '德航', fullName: '德航·导航航旅',
    category: 'transport', categoryLabel: '出行物流',
    description: '无障碍导航地图、旅行辅助规划、出行实时路况信息，为残障人士提供可通行的路线指引',
    icon: 'Navigation', color: 'bg-lime-500',
    features: ['无障碍导航', '旅行辅助', '出行规划', '实时路况'],
    status: 'developing', priority: 22,
    formFields: [
      { name: 'routeType', label: '路线类型', type: 'select', options: ['无障碍通道', '公共交通', '自驾路线', '步行导航'], required: true },
      { name: 'startPoint', label: '起点', type: 'text', required: true },
      { name: 'endPoint', label: '终点', type: 'text', required: true },
      { name: 'accessibilityNeeds', label: '无障碍需求', type: 'select', options: ['轮椅通道', '盲道', '电梯可达', '低地板公交'] },
      { name: 'notes', label: '出行备注', type: 'textarea', placeholder: '特殊注意事项' },
    ]
  },
  {
    code: 'deshi', name: '德时', fullName: '德时·时间管理',
    category: 'transport', categoryLabel: '出行物流',
    description: '预约排期管理、时间银行储蓄、志愿服务时长记录，让时间成为可交换的互助资源',
    icon: 'Clock', color: 'bg-rose-500',
    features: ['预约排期', '时间银行', '志愿时长', '日程管理'],
    status: 'active', priority: 23,
    formFields: [
      { name: 'scheduleType', label: '排期类型', type: 'select', options: ['服务预约', '时间存入', '时间支出', '志愿服务'], required: true },
      { name: 'serviceItem', label: '服务项目', type: 'text', required: true, placeholder: '如：上门理发、代购药品' },
      { name: 'duration', label: '时长(分钟)', type: 'number', required: true },
      { name: 'scheduledDate', label: '预约日期', type: 'date' },
      { name: 'location', label: '服务地点', type: 'text' },
      { name: 'notes', label: '备注', type: 'textarea' },
    ]
  },

  // ===== 💰 经济金融类 (finance) =====
  {
    code: 'dejuan', name: '德捐', fullName: '德捐·捐赠管理',
    category: 'finance', categoryLabel: '经济金融',
    description: '捐赠项目全流程管理、资金使用透明追踪、善款分配公示，确保每一分善款都有据可查',
    icon: 'Heart', color: 'bg-pink-500',
    features: ['项目捐赠', '资金透明', '善款追踪', '捐赠证书'],
    status: 'active', priority: 30,
    formFields: [
      { name: 'donationType', label: '捐赠类型', type: 'select', options: ['资金捐赠', '物资捐赠', '服务捐赠', '技能捐赠'], required: true },
      { name: 'amount', label: '捐赠金额/价值', type: 'number', required: true },
      { name: 'targetProject', label: '捐赠项目', type: 'text', placeholder: '指定项目或非定向' },
      { name: 'isAnonymous', label: '匿名捐赠', type: 'toggle' },
      { name: 'message', label: '捐赠寄语', type: 'textarea', placeholder: '对受助者的鼓励与祝福' },
    ]
  },
  {
    code: 'dexiao', name: '德消', fullName: '德消·消费商城',
    category: 'finance', categoryLabel: '经济金融',
    description: '公益消费平台、助残产品展销、消费返善机制，让日常消费也能创造社会价值',
    icon: 'ShoppingBag', color: 'bg-orange-500',
    features: ['公益消费', '助残产品', '消费返善', '优惠补贴'],
    status: 'developing', priority: 31,
    formFields: [
      { name: 'productType', label: '产品类型', type: 'select', options: ['助残产品', '农产品', '手工艺品', '康复器材', '日常用品'], required: true },
      { name: 'productName', label: '产品名称', type: 'text', required: true },
      { name: 'price', label: '价格', type: 'number', required: true },
      { name: 'charityRatio', label: '公益返善比例(%)', type: 'number', placeholder: '消费金额中返还公益的比例' },
      { name: 'description', label: '产品描述', type: 'textarea', placeholder: '产品详细说明与助残背景' },
    ]
  },
  {
    code: 'dedian', name: '德垫', fullName: '德垫·垫付预支',
    category: 'finance', categoryLabel: '经济金融',
    description: '医疗费用垫付、紧急资金预支、互助兜底保障，为急需帮助的残障人士提供及时的资金支持',
    icon: 'Banknote', color: 'bg-amber-500',
    features: ['医疗垫付', '紧急预支', '互助兜底', '还款计划'],
    status: 'active', priority: 32,
    formFields: [
      { name: 'advanceType', label: '垫付类型', type: 'select', options: ['医疗垫付', '教育垫付', '应急预支', '生活救助'], required: true },
      { name: 'amount', label: '垫付金额', type: 'number', required: true },
      { name: 'urgency', label: '紧急程度', type: 'select', options: ['一般', '较急', '紧急', '非常紧急'], required: true },
      { name: 'reason', label: '申请原因', type: 'textarea', required: true, placeholder: '详细说明垫付原因与还款计划' },
      { name: 'repaymentPlan', label: '还款计划', type: 'select', options: ['一次性还款', '分期还款', '以工代还', '暂缓还款'] },
    ]
  },
  {
    code: 'deya', name: '德押', fullName: '德押·担保抵押',
    category: 'finance', categoryLabel: '经济金融',
    description: '公益信用担保、风险保障机制、抵押贷款评估，降低残障人士的金融服务门槛',
    icon: 'Shield', color: 'bg-yellow-600',
    features: ['公益担保', '信用评估', '风险保障', '抵押管理'],
    status: 'developing', priority: 33,
    formFields: [
      { name: 'guaranteeType', label: '担保类型', type: 'select', options: ['信用担保', '项目担保', '互助担保', '抵押担保'], required: true },
      { name: 'amount', label: '担保金额', type: 'number', required: true },
      { name: 'beneficiary', label: '被担保人', type: 'text', required: true },
      { name: 'period', label: '担保期限', type: 'text', placeholder: '如：6个月、1年' },
      { name: 'riskAssessment', label: '风险评估', type: 'select', options: ['低风险', '中等风险', '较高风险'] },
      { name: 'conditions', label: '担保条件', type: 'textarea', placeholder: '担保的附加条件与要求' },
    ]
  },
  {
    code: 'degong', name: '德贡', fullName: '德贡·贡献记录',
    category: 'finance', categoryLabel: '经济金融',
    description: '个人公益贡献全量记录、价值量化评估、荣誉积分积累，让每一份善行都被铭记',
    icon: 'Award', color: 'bg-yellow-500',
    features: ['贡献记录', '价值评估', '荣誉积累', '公益档案'],
    status: 'active', priority: 34,
    formFields: [
      { name: 'contributionType', label: '贡献类型', type: 'select', options: ['资金贡献', '物资贡献', '时间贡献', '技能贡献', '传播贡献'], required: true },
      { name: 'description', label: '贡献描述', type: 'textarea', required: true, placeholder: '详细描述贡献内容' },
      { name: 'estimatedValue', label: '估算价值', type: 'number', placeholder: '贡献的市场估值' },
      { name: 'beneficiary', label: '受益对象', type: 'text', placeholder: '贡献的受益人/项目' },
      { name: 'evidence', label: '贡献凭证', type: 'textarea', placeholder: '相关证明材料描述' },
    ]
  },

  // ===== 🏥 医疗健康类 (medical) =====
  {
    code: 'dezhen', name: '德诊', fullName: '德诊·远程诊断',
    category: 'medical', categoryLabel: '医疗健康',
    description: '远程医疗问诊、智能症状分诊、健康数据持续监测，让优质医疗资源惠及农村残疾人',
    icon: 'Stethoscope', color: 'bg-red-500',
    features: ['远程问诊', '智能分诊', '健康监测', '处方管理'],
    status: 'active', priority: 40,
    formFields: [
      { name: 'consultType', label: '问诊类型', type: 'select', options: ['图文问诊', '视频问诊', '电话问诊', '紧急咨询'], required: true },
      { name: 'department', label: '科室', type: 'select', options: ['内科', '外科', '康复科', '精神科', '眼科', '耳鼻喉科', '骨科', '中医科'], required: true },
      { name: 'symptoms', label: '症状描述', type: 'textarea', required: true, placeholder: '详细描述症状、持续时间、严重程度' },
      { name: 'medicalHistory', label: '既往病史', type: 'textarea', placeholder: '既往疾病、手术、过敏史' },
      { name: 'urgency', label: '紧急程度', type: 'select', options: ['普通', '较急', '紧急'] },
    ]
  },
  {
    code: 'dewei', name: '德卫', fullName: '德卫·卫生保健',
    category: 'medical', categoryLabel: '医疗健康',
    description: '社区卫生服务、预防接种管理、个人健康档案建立，构建基层健康防护网',
    icon: 'HeartPulse', color: 'bg-pink-600',
    features: ['社区卫生', '防疫接种', '健康档案', '保健计划'],
    status: 'active', priority: 41,
    formFields: [
      { name: 'serviceType', label: '服务类型', type: 'select', options: ['健康体检', '疫苗接种', '保健指导', '慢病管理', '康复训练'], required: true },
      { name: 'healthCategory', label: '健康分类', type: 'select', options: ['一般体检', '残疾相关', '老年保健', '儿童保健', '心理健康'] },
      { name: 'findings', label: '检查/服务结果', type: 'textarea', placeholder: '体检结果或服务记录' },
      { name: 'nextVisit', label: '下次随访日期', type: 'date' },
      { name: 'doctorNotes', label: '医嘱建议', type: 'textarea' },
    ]
  },
  {
    code: 'dezhao', name: '德照', fullName: '德照·照护服务',
    category: 'medical', categoryLabel: '医疗健康',
    description: '居家照护服务、日间照料中心、喘息服务支持、护工管理调度，全方位关怀残障人士生活',
    icon: 'HandHeart', color: 'bg-pink-400',
    features: ['居家照护', '日间照料', '喘息服务', '护工管理'],
    status: 'active', priority: 42,
    formFields: [
      { name: 'careType', label: '照护类型', type: 'select', options: ['居家照护', '日间照料', '喘息服务', '临时看护', '夜间陪护'], required: true },
      { name: 'careLevel', label: '照护等级', type: 'select', options: ['轻度', '中度', '重度', '特重度'] },
      { name: 'duration', label: '服务时长', type: 'text', placeholder: '如：2小时/天、全天' },
      { name: 'startDate', label: '开始日期', type: 'date' },
      { name: 'specialNeeds', label: '特殊需求', type: 'textarea', placeholder: '照护对象的特殊需求与注意事项' },
    ]
  },
  {
    code: 'dejie', name: '德洁', fullName: '德洁·家政清洁',
    category: 'medical', categoryLabel: '医疗健康',
    description: '残障友好家政清洁、居家整理服务、助残优惠上门，改善残障人士居住环境',
    icon: 'Sparkles', color: 'bg-fuchsia-500',
    features: ['家政服务', '清洁整理', '助残优惠', '上门服务'],
    status: 'active', priority: 43,
    formFields: [
      { name: 'serviceType', label: '服务类型', type: 'select', options: ['日常清洁', '深度保洁', '收纳整理', '洗衣服务', '做饭服务'], required: true },
      { name: 'address', label: '服务地址', type: 'text', required: true },
      { name: 'scheduledDate', label: '预约日期', type: 'date' },
      { name: 'duration', label: '服务时长(小时)', type: 'number' },
      { name: 'specialRequirements', label: '特殊要求', type: 'textarea', placeholder: '如有宠物、特殊清洁需求等' },
    ]
  },
  {
    code: 'dexiu', name: '德修', fullName: '德修·维修服务',
    category: 'medical', categoryLabel: '医疗健康',
    description: '辅具维修保养、房屋修缮维护、设备定期检修，确保残障人士的生活设备始终处于良好状态',
    icon: 'Wrench', color: 'bg-orange-600',
    features: ['辅具维修', '房屋修缮', '设备维护', '上门服务'],
    status: 'active', priority: 44,
    formFields: [
      { name: 'repairType', label: '维修类型', type: 'select', options: ['辅具维修', '房屋修缮', '电器维修', '管道维修', '其他维修'], required: true },
      { name: 'itemName', label: '维修物品', type: 'text', required: true, placeholder: '需要维修的物品名称' },
      { name: 'issue', label: '故障描述', type: 'textarea', required: true, placeholder: '详细描述故障情况' },
      { name: 'urgency', label: '紧急程度', type: 'select', options: ['一般', '较急', '紧急'] },
      { name: 'address', label: '维修地址', type: 'text', required: true },
    ]
  },

  // ===== 📚 文化教育类 (culture) =====
  {
    code: 'deshu', name: '德书', fullName: '德书·图书文献',
    category: 'culture', categoryLabel: '文化教育',
    description: '无障碍阅读资源、有声图书库、盲文文献服务、知识共享社区，让阅读无障碍',
    icon: 'BookOpen', color: 'bg-purple-500',
    features: ['无障碍阅读', '有声图书', '盲文资源', '知识共享'],
    status: 'active', priority: 50,
    formFields: [
      { name: 'resourceType', label: '资源类型', type: 'select', options: ['有声书', '盲文书籍', '大字版', '电子书', '手语视频'], required: true },
      { name: 'title', label: '书名/资源名', type: 'text', required: true },
      { name: 'category', label: '分类', type: 'select', options: ['文学', '教育', '科技', '法律', '康复', '生活', '历史'] },
      { name: 'author', label: '作者', type: 'text' },
      { name: 'accessibility', label: '无障碍格式', type: 'select', options: ['语音朗读', '盲文点字', '放大字体', '手语翻译', '字幕'] },
      { name: 'description', label: '资源描述', type: 'textarea' },
    ]
  },
  {
    code: 'deju', name: '德剧', fullName: '德剧·戏剧影视',
    category: 'culture', categoryLabel: '文化教育',
    description: '无障碍影视制作、手语剧场演出、文化展演活动，用艺术传递残健共融的力量',
    icon: 'Drama', color: 'bg-violet-500',
    features: ['无障碍影视', '手语剧场', '文化展演', '艺术康复'],
    status: 'developing', priority: 51,
    formFields: [
      { name: 'eventType', label: '活动类型', type: 'select', options: ['手语剧场', '无障碍影视', '文化展演', '艺术工作坊'], required: true },
      { name: 'title', label: '剧目/活动名称', type: 'text', required: true },
      { name: 'date', label: '演出日期', type: 'date' },
      { name: 'venue', label: '演出场地', type: 'text' },
      { name: 'accessibilityFeatures', label: '无障碍服务', type: 'select', options: ['手语翻译', '语音描述', '字幕', '触觉导览'] },
      { name: 'description', label: '活动描述', type: 'textarea' },
    ]
  },
  {
    code: 'deyan', name: '德演', fullName: '德演·演出活动',
    category: 'culture', categoryLabel: '文化教育',
    description: '公益演出策划、残健融合文化活动、才艺展示舞台，为残障艺术家搭建展示才华的平台',
    icon: 'Mic', color: 'bg-fuchsia-600',
    features: ['公益演出', '文化活动', '才艺展示', '艺术交流'],
    status: 'developing', priority: 52,
    formFields: [
      { name: 'activityType', label: '活动类型', type: 'select', options: ['公益演出', '才艺比赛', '文化展览', '艺术交流'], required: true },
      { name: 'title', label: '活动名称', type: 'text', required: true },
      { name: 'date', label: '活动日期', type: 'date' },
      { name: 'location', label: '活动地点', type: 'text' },
      { name: 'participants', label: '参与人数', type: 'number' },
      { name: 'description', label: '活动详情', type: 'textarea' },
    ]
  },
  {
    code: 'deman', name: '德漫', fullName: '德漫·文创动漫',
    category: 'culture', categoryLabel: '文化教育',
    description: '残健主题漫画创作、文创产品开发、IP品牌运营，用创意讲述助残故事',
    icon: 'Brush', color: 'bg-pink-700',
    features: ['主题漫画', '文创产品', 'IP开发', '创意设计'],
    status: 'planned', priority: 53,
    formFields: [
      { name: 'creativeType', label: '创作类型', type: 'select', options: ['漫画', '插画', '动画', '文创设计', 'IP形象'], required: true },
      { name: 'title', label: '作品名称', type: 'text', required: true },
      { name: 'theme', label: '主题', type: 'select', options: ['残健共融', '助残故事', '无障碍倡导', '公益精神', '励志人生'] },
      { name: 'description', label: '作品描述', type: 'textarea', placeholder: '作品创意说明与设计理念' },
    ]
  },
  {
    code: 'dejiao', name: '德教', fullName: '德教·教育培训',
    category: 'culture', categoryLabel: '文化教育',
    description: '职业技能培训、特殊教育教学、远程在线课堂、证书认证体系，赋能残障人士自我发展',
    icon: 'GraduationCap', color: 'bg-blue-600',
    features: ['职业培训', '技能教育', '远程课堂', '证书认证'],
    status: 'active', priority: 54,
    formFields: [
      { name: 'courseType', label: '课程类型', type: 'select', options: ['职业技能', '文化课程', '康复训练', '心理辅导', '法律知识'], required: true },
      { name: 'courseName', label: '课程名称', type: 'text', required: true },
      { name: 'teachingMode', label: '教学方式', type: 'select', options: ['线上直播', '录播课程', '线下教学', '一对一辅导'] },
      { name: 'duration', label: '课程时长', type: 'text', placeholder: '如：12课时/4周' },
      { name: 'targetAudience', label: '适用对象', type: 'select', options: ['肢体残疾', '视力残疾', '听力残疾', '智力残疾', '全部类型'] },
      { name: 'description', label: '课程描述', type: 'textarea' },
    ]
  },
  {
    code: 'deyanjiu', name: '德研', fullName: '德研·科研研究',
    category: 'culture', categoryLabel: '文化教育',
    description: '残障领域学术研究、政策分析解读、数据报告发布、学术交流平台，以研究推动政策改善',
    icon: 'Microscope', color: 'bg-indigo-600',
    features: ['残障研究', '政策分析', '数据报告', '学术交流'],
    status: 'developing', priority: 55,
    formFields: [
      { name: 'researchType', label: '研究类型', type: 'select', options: ['学术研究', '政策分析', '数据报告', '调研项目', '案例研究'], required: true },
      { name: 'title', label: '研究课题', type: 'text', required: true },
      { name: 'field', label: '研究领域', type: 'select', options: ['康复医学', '无障碍设计', '社会政策', '心理研究', '教育研究', '就业研究'] },
      { name: 'abstract', label: '研究摘要', type: 'textarea', placeholder: '研究目的、方法与预期成果' },
    ]
  },
  {
    code: 'dexue', name: '德学', fullName: '德学·学习课程',
    category: 'culture', categoryLabel: '文化教育',
    description: '在线学习平台、知识共享社区、互助学习小组、课程评价体系，让学习随时随地发生',
    icon: 'School', color: 'bg-cyan-600',
    features: ['在线学习', '知识共享', '互助学习', '课程评价'],
    status: 'active', priority: 56,
    formFields: [
      { name: 'learningType', label: '学习类型', type: 'select', options: ['自主学习', '互助学习', '小组学习', '导师辅导'], required: true },
      { name: 'subject', label: '学习科目', type: 'text', required: true },
      { name: 'level', label: '学习难度', type: 'select', options: ['入门', '初级', '中级', '高级'] },
      { name: 'progress', label: '学习进度(%)', type: 'number' },
      { name: 'notes', label: '学习笔记', type: 'textarea' },
    ]
  },
  {
    code: 'dechuan', name: '德传', fullName: '德传·传播宣传',
    category: 'culture', categoryLabel: '文化教育',
    description: '公益传播策划、媒体报道对接、社会倡导活动、品牌形象建设，扩大助残事业社会影响力',
    icon: 'Megaphone', color: 'bg-purple-600',
    features: ['公益传播', '媒体报道', '社会倡导', '品牌建设'],
    status: 'active', priority: 57,
    formFields: [
      { name: 'campaignType', label: '传播类型', type: 'select', options: ['公益广告', '媒体报道', '社交传播', '活动宣传', '品牌推广'], required: true },
      { name: 'title', label: '传播主题', type: 'text', required: true },
      { name: 'channel', label: '传播渠道', type: 'select', options: ['微信公众号', '抖音', '微博', '电视', '报纸', '户外广告'] },
      { name: 'targetAudience', label: '目标受众', type: 'text' },
      { name: 'description', label: '传播内容', type: 'textarea', placeholder: '传播内容与核心信息' },
    ]
  },

  // ===== ⚖️ 治理监督类 (governance) =====
  {
    code: 'dexie', name: '德协', fullName: '德协·协调协作',
    category: 'governance', categoryLabel: '治理监督',
    description: '跨部门协调机制、资源整合调度、多方协作平台、冲突调解服务，凝聚各方助残合力',
    icon: 'Handshake', color: 'bg-indigo-500',
    features: ['跨部门协调', '资源整合', '多方协作', '冲突调解'],
    status: 'active', priority: 60,
    formFields: [
      { name: 'coordinationType', label: '协调类型', type: 'select', options: ['跨部门协作', '资源整合', '项目协调', '冲突调解'], required: true },
      { name: 'parties', label: '协作方', type: 'text', required: true, placeholder: '参与的部门/组织/个人' },
      { name: 'issue', label: '协调事项', type: 'textarea', required: true, placeholder: '需要协调的具体事项' },
      { name: 'priority', label: '优先级', type: 'select', options: ['低', '中', '高', '紧急'] },
      { name: 'resolution', label: '协调方案', type: 'textarea', placeholder: '建议的解决方案' },
    ]
  },
  {
    code: 'dedu', name: '德督', fullName: '德督·监督审计',
    category: 'governance', categoryLabel: '治理监督',
    description: '资金使用监督、项目执行审计、合规性检查、举报受理机制，确保公益事业的公信力',
    icon: 'Eye', color: 'bg-blue-700',
    features: ['资金监督', '项目审计', '合规检查', '举报受理'],
    status: 'active', priority: 61,
    formFields: [
      { name: 'auditType', label: '审计类型', type: 'select', options: ['资金审计', '项目审计', '合规检查', '举报调查'], required: true },
      { name: 'target', label: '审计对象', type: 'text', required: true, placeholder: '被审计的项目/部门/个人' },
      { name: 'findings', label: '审计发现', type: 'textarea', placeholder: '审计过程中发现的问题' },
      { name: 'severity', label: '问题严重程度', type: 'select', options: ['轻微', '一般', '严重', '重大'] },
      { name: 'recommendation', label: '整改建议', type: 'textarea' },
    ]
  },
  {
    code: 'dejiancha', name: '德检', fullName: '德检·检验检测',
    category: 'governance', categoryLabel: '治理监督',
    description: '产品质量检验、无障碍标准检测、安全评估认证，保障残障人士使用的产品与服务质量',
    icon: 'SearchCheck', color: 'bg-teal-600',
    features: ['质量检验', '标准检测', '安全评估', '认证服务'],
    status: 'developing', priority: 62,
    formFields: [
      { name: 'inspectionType', label: '检验类型', type: 'select', options: ['辅具检验', '设施检测', '食品检测', '安全评估', '标准认证'], required: true },
      { name: 'targetName', label: '检验对象', type: 'text', required: true },
      { name: 'standard', label: '检验标准', type: 'text', placeholder: '适用的标准/规范' },
      { name: 'result', label: '检验结果', type: 'select', options: ['合格', '不合格', '待整改', '复检'] },
      { name: 'details', label: '检验详情', type: 'textarea', placeholder: '检验过程与结果详情' },
    ]
  },
  {
    code: 'dejianji', name: '德鉴', fullName: '德鉴·鉴定评估',
    category: 'governance', categoryLabel: '治理监督',
    description: '残疾等级鉴定、服务需求评估、资质认证审核、专家评审机制，为精准帮扶提供专业依据',
    icon: 'BadgeCheck', color: 'bg-emerald-600',
    features: ['残疾鉴定', '需求评估', '资质认证', '专家评审'],
    status: 'active', priority: 63,
    formFields: [
      { name: 'assessmentType', label: '鉴定类型', type: 'select', options: ['残疾等级鉴定', '需求评估', '资质认证', '能力评估'], required: true },
      { name: 'applicant', label: '申请人', type: 'text', required: true },
      { name: 'category', label: '鉴定类别', type: 'select', options: ['肢体', '视力', '听力', '言语', '智力', '精神', '多重'] },
      { name: 'result', label: '鉴定结论', type: 'textarea', placeholder: '鉴定/评估的结论意见' },
      { name: 'validUntil', label: '有效期至', type: 'date' },
    ]
  },
  {
    code: 'depan', name: '德判', fullName: '德判·评审裁决',
    category: 'governance', categoryLabel: '治理监督',
    description: '争议公正调解、权益纠纷裁决、案例库建设，维护残障人士合法权益的最后一道防线',
    icon: 'Scale', color: 'bg-gray-600',
    features: ['争议调解', '公正评审', '权益裁定', '案例库'],
    status: 'developing', priority: 64,
    formFields: [
      { name: 'caseType', label: '案件类型', type: 'select', options: ['权益争议', '合同纠纷', '劳动争议', '歧视投诉', '其他'], required: true },
      { name: 'parties', label: '当事人', type: 'text', required: true },
      { name: 'caseDesc', label: '案件描述', type: 'textarea', required: true, placeholder: '详细描述争议/纠纷情况' },
      { name: 'ruling', label: '裁决意见', type: 'textarea', placeholder: '调解/裁决的意见' },
      { name: 'status', label: '案件状态', type: 'select', options: ['受理中', '调解中', '已裁决', '已执行'] },
    ]
  },
  {
    code: 'depiao', name: '德票', fullName: '德票·投票选举',
    category: 'governance', categoryLabel: '治理监督',
    description: '社区民主投票、组织选举管理、公共决策公投、结果透明公示，保障残健共同体的民主权利',
    icon: 'Vote', color: 'bg-green-600',
    features: ['民主投票', '社区选举', '决策公投', '结果公示'],
    status: 'developing', priority: 65,
    formFields: [
      { name: 'voteType', label: '投票类型', type: 'select', options: ['社区选举', '方案公投', '项目评选', '民主决策'], required: true },
      { name: 'topic', label: '投票议题', type: 'text', required: true },
      { name: 'options', label: '投票选项', type: 'textarea', required: true, placeholder: '每行一个选项' },
      { name: 'deadline', label: '截止日期', type: 'date' },
      { name: 'isAnonymous', label: '匿名投票', type: 'toggle' },
      { name: 'description', label: '投票说明', type: 'textarea' },
    ]
  },
  {
    code: 'dezheng', name: '德贞', fullName: '德贞·诚信认证',
    category: 'governance', categoryLabel: '治理监督',
    description: '身份认证验证、信用评分体系、诚信档案管理、黑名单预警，构建值得信赖的公益生态',
    icon: 'ShieldCheck', color: 'bg-sky-600',
    features: ['身份认证', '信用评分', '诚信档案', '黑名单'],
    status: 'active', priority: 66,
    formFields: [
      { name: 'certType', label: '认证类型', type: 'select', options: ['身份认证', '机构认证', '项目认证', '信用评估'], required: true },
      { name: 'target', label: '认证对象', type: 'text', required: true },
      { name: 'creditScore', label: '信用评分', type: 'number', placeholder: '0-1000' },
      { name: 'certResult', label: '认证结果', type: 'select', options: ['通过', '待补充材料', '未通过', '需复核'] },
      { name: 'remarks', label: '认证备注', type: 'textarea', placeholder: '认证过程中的发现与建议' },
    ]
  },

  // ===== 🆘 应急安全类 (emergency) =====
  {
    code: 'deji', name: '德急', fullName: '德急·急救应急',
    category: 'emergency', categoryLabel: '应急安全',
    description: '紧急求助一键呼救、急救指导流程、应急响应调度，在危急时刻守护残障人士安全',
    icon: 'Siren', color: 'bg-red-600',
    features: ['紧急求助', '急救指导', '应急响应', '一键呼救'],
    status: 'active', priority: 70,
    formFields: [
      { name: 'emergencyType', label: '紧急类型', type: 'select', options: ['医疗急救', '安全事故', '自然灾害', '走失求助', '其他紧急'], required: true },
      { name: 'location', label: '当前位置', type: 'text', required: true },
      { name: 'description', label: '紧急情况描述', type: 'textarea', required: true, placeholder: '详细描述当前紧急情况' },
      { name: 'injuryLevel', label: '伤害程度', type: 'select', options: ['轻微', '一般', '严重', '危及生命'] },
      { name: 'contactName', label: '联系人', type: 'text' },
      { name: 'contactPhone', label: '联系电话', type: 'text' },
    ]
  },
  {
    code: 'dejing', name: '德警', fullName: '德警·安全预警',
    category: 'emergency', categoryLabel: '应急安全',
    description: '风险预警通知、安全提醒推送、灾害预警信息、防范指南发布，防患于未然',
    icon: 'AlertTriangle', color: 'bg-amber-600',
    features: ['风险预警', '安全提醒', '灾害通知', '防范指南'],
    status: 'active', priority: 71,
    formFields: [
      { name: 'alertType', label: '预警类型', type: 'select', options: ['气象预警', '地质灾害', '公共安全', '健康预警', '诈骗提醒'], required: true },
      { name: 'severity', label: '预警级别', type: 'select', options: ['蓝色(一般)', '黄色(较重)', '橙色(严重)', '红色(特别严重)'], required: true },
      { name: 'affectedArea', label: '影响区域', type: 'text', required: true },
      { name: 'description', label: '预警内容', type: 'textarea', required: true, placeholder: '详细预警信息与影响范围' },
      { name: 'precautions', label: '防范措施', type: 'textarea', placeholder: '建议采取的防范措施' },
    ]
  },
  {
    code: 'deyuan', name: '德援', fullName: '德援·援助救援',
    category: 'emergency', categoryLabel: '应急安全',
    description: '灾害救援协调、紧急物资调配、志愿力量调度，在灾害面前不让任何一个残障人士掉队',
    icon: 'LifeBuoy', color: 'bg-rose-600',
    features: ['灾害救援', '紧急援助', '物资调配', '志愿调度'],
    status: 'active', priority: 72,
    formFields: [
      { name: 'rescueType', label: '救援类型', type: 'select', options: ['灾害救援', '物资援助', '人员转移', '心理援助', '灾后重建'], required: true },
      { name: 'location', label: '救援地点', type: 'text', required: true },
      { name: 'affectedPeople', label: '受灾人数', type: 'number' },
      { name: 'needs', label: '救援需求', type: 'textarea', required: true, placeholder: '需要的物资、人员、设备等' },
      { name: 'urgency', label: '紧急程度', type: 'select', options: ['一般', '紧急', '非常紧急'] },
    ]
  },
  {
    code: 'deshou', name: '德守', fullName: '德守·守护监护',
    category: 'emergency', categoryLabel: '应急安全',
    description: '残疾人安全监护、位置跟踪预警、紧急联系网络、守护计划制定，让关爱时刻在线',
    icon: 'ShieldAlert', color: 'bg-red-700',
    features: ['安全监护', '定位跟踪', '紧急联系', '守护计划'],
    status: 'developing', priority: 73,
    formFields: [
      { name: 'guardianType', label: '监护类型', type: 'select', options: ['日常监护', '出行监护', '居家安全', '医疗监护'], required: true },
      { name: 'wardName', label: '被监护人', type: 'text', required: true },
      { name: 'guardianName', label: '监护人', type: 'text', required: true },
      { name: 'checkFrequency', label: '检查频率', type: 'select', options: ['每小时', '每天', '每周', '自定义'] },
      { name: 'emergencyContact', label: '紧急联系人', type: 'text' },
      { name: 'specialNotes', label: '特别注意事项', type: 'textarea' },
    ]
  },

  // ===== 📢 社交传播类 (social) =====
  {
    code: 'dexun', name: '德讯', fullName: '德讯·资讯信息',
    category: 'social', categoryLabel: '社交传播',
    description: '公益资讯聚合、政策法规解读、新闻速递推送、专题深度报道，做残障社群的信息灯塔',
    icon: 'Newspaper', color: 'bg-pink-500',
    features: ['公益资讯', '政策解读', '新闻速递', '专题报道'],
    status: 'active', priority: 80,
    formFields: [
      { name: 'newsType', label: '资讯类型', type: 'select', options: ['政策法规', '行业动态', '助残新闻', '公益故事', '专题报道'], required: true },
      { name: 'title', label: '资讯标题', type: 'text', required: true },
      { name: 'source', label: '信息来源', type: 'text' },
      { name: 'summary', label: '内容摘要', type: 'textarea', required: true, placeholder: '资讯内容概要' },
      { name: 'importance', label: '重要程度', type: 'select', options: ['普通', '重要', '紧急'] },
    ]
  },
  {
    code: 'debo', name: '德播', fullName: '德播·直播广播',
    category: 'social', categoryLabel: '社交传播',
    description: '公益直播平台、手语同步播报、在线互动答疑、回放点播服务，让信息传播无障碍',
    icon: 'Radio', color: 'bg-fuchsia-500',
    features: ['公益直播', '手语播报', '在线互动', '回放点播'],
    status: 'developing', priority: 81,
    formFields: [
      { name: 'broadcastType', label: '播报类型', type: 'select', options: ['公益直播', '手语新闻', '政策解读直播', '活动直播', '在线课堂'], required: true },
      { name: 'title', label: '播报主题', type: 'text', required: true },
      { name: 'scheduledTime', label: '直播时间', type: 'date' },
      { name: 'hasSignLanguage', label: '手语翻译', type: 'toggle' },
      { name: 'hasSubtitle', label: '实时字幕', type: 'toggle' },
      { name: 'description', label: '内容描述', type: 'textarea' },
    ]
  },
  {
    code: 'delian', name: '德联', fullName: '德联·联盟合作',
    category: 'social', categoryLabel: '社交传播',
    description: '助残组织联盟、志愿者网络建设、资源精准对接、合作协议管理，连接每一份助残力量',
    icon: 'Network', color: 'bg-violet-600',
    features: ['组织联盟', '志愿网络', '资源对接', '合作协议'],
    status: 'active', priority: 82,
    formFields: [
      { name: 'allianceType', label: '联盟类型', type: 'select', options: ['组织联盟', '志愿网络', '企业合作', '政府合作', '学术合作'], required: true },
      { name: 'orgName', label: '组织名称', type: 'text', required: true },
      { name: 'contactPerson', label: '联系人', type: 'text' },
      { name: 'cooperationArea', label: '合作领域', type: 'text', placeholder: '合作的具体领域与方向' },
      { name: 'agreementDetails', label: '合作详情', type: 'textarea', placeholder: '合作协议内容与条款' },
    ]
  },
  {
    code: 'defang', name: '德访', fullName: '德访·家访关怀',
    category: 'social', categoryLabel: '社交传播',
    description: '入户家访调研、需求精准摸底、关怀慰问活动、跟踪回访机制，走到残疾人身边去',
    icon: 'Home', color: 'bg-green-700',
    features: ['入户家访', '需求调研', '关怀慰问', '跟踪回访'],
    status: 'active', priority: 83,
    formFields: [
      { name: 'visitType', label: '家访类型', type: 'select', options: ['需求调研', '关怀慰问', '跟踪回访', '信息核实', '帮扶评估'], required: true },
      { name: 'visitTarget', label: '家访对象', type: 'text', required: true },
      { name: 'visitDate', label: '家访日期', type: 'date' },
      { name: 'address', label: '家访地址', type: 'text', required: true },
      { name: 'findings', label: '家访发现', type: 'textarea', placeholder: '家访中了解到的需求与情况' },
      { name: 'followUp', label: '后续计划', type: 'textarea' },
    ]
  },
  {
    code: 'dejing2', name: '德敬', fullName: '德敬·荣誉致敬',
    category: 'social', categoryLabel: '社交传播',
    description: '公益人物表彰、荣誉勋章体系、致敬仪式策划、榜样力量传播，让善行被看见被尊重',
    icon: 'Crown', color: 'bg-amber-500',
    features: ['公益人物', '荣誉表彰', '致敬仪式', '榜样力量'],
    status: 'active', priority: 84,
    formFields: [
      { name: 'honorType', label: '荣誉类型', type: 'select', options: ['公益人物', '优秀志愿者', '杰出贡献', '特别致敬', '年度榜样'], required: true },
      { name: 'honoreeName', label: '获奖人/组织', type: 'text', required: true },
      { name: 'achievement', label: '获奖事迹', type: 'textarea', required: true, placeholder: '详细描述获奖者的贡献与事迹' },
      { name: 'ceremonyDate', label: '表彰日期', type: 'date' },
      { name: 'awardLevel', label: '表彰级别', type: 'select', options: ['社区级', '区县级', '市级', '省级', '国家级'] },
    ]
  },

  // ===== 💡 创业赋能类 (innovation) =====
  {
    code: 'dechuang', name: '德创', fullName: '德创·创新创业',
    category: 'innovation', categoryLabel: '创业赋能',
    description: '残障创业孵化器、项目路演平台、融资对接服务、导师辅导体系，助力残障人士实现创业梦想',
    icon: 'Rocket', color: 'bg-cyan-600',
    features: ['创业孵化', '项目路演', '融资对接', '导师辅导'],
    status: 'active', priority: 90,
    formFields: [
      { name: 'projectName', label: '项目名称', type: 'text', required: true },
      { name: 'projectStage', label: '项目阶段', type: 'select', options: ['创意阶段', '种子期', '初创期', '成长期', '扩张期'], required: true },
      { name: 'industry', label: '行业领域', type: 'select', options: ['电商零售', '餐饮服务', '手工艺', '技术服务', '文化创意', '教育培训', '农业养殖'] },
      { name: 'fundingNeeded', label: '融资金额', type: 'number' },
      { name: 'businessPlan', label: '项目简介', type: 'textarea', required: true, placeholder: '商业模式、竞争优势、发展规划' },
      { name: 'supportNeeded', label: '所需支持', type: 'textarea', placeholder: '需要的资源与支持' },
    ]
  },
  {
    code: 'dedao', name: '德导', fullName: '德导·导购导览',
    category: 'innovation', categoryLabel: '创业赋能',
    description: '无障碍导购服务、购物决策辅助、消费优惠推荐、产品适配指导，让消费也充满关怀',
    icon: 'Compass', color: 'bg-teal-500',
    features: ['无障碍导购', '购物辅助', '消费指导', '优惠推荐'],
    status: 'developing', priority: 91,
    formFields: [
      { name: 'guideType', label: '导购类型', type: 'select', options: ['辅具导购', '日用品推荐', '优惠信息', '消费指导'], required: true },
      { name: 'productCategory', label: '产品类别', type: 'select', options: ['辅具器械', '生活用品', '康复器材', '数码产品', '食品保健'] },
      { name: 'budget', label: '预算范围', type: 'text', placeholder: '如：500-1000元' },
      { name: 'disabilityType', label: '适配残疾类型', type: 'select', options: ['肢体残疾', '视力残疾', '听力残疾', '通用'] },
      { name: 'recommendations', label: '推荐说明', type: 'textarea', placeholder: '推荐理由与使用建议' },
    ]
  },
  {
    code: 'deshe', name: '德摄', fullName: '德摄·影像服务',
    category: 'innovation', categoryLabel: '创业赋能',
    description: '无障碍摄影服务、影像档案记录、视觉辅助工具、作品展示平台，用镜头记录美好',
    icon: 'Camera', color: 'bg-slate-600',
    features: ['无障碍摄影', '影像记录', '视觉辅助', '相册管理'],
    status: 'planned', priority: 92,
    formFields: [
      { name: 'serviceType', label: '服务类型', type: 'select', options: ['摄影服务', '视频制作', '证件照', '活动记录', '视觉辅助'], required: true },
      { name: 'subject', label: '拍摄主题', type: 'text', required: true },
      { name: 'location', label: '拍摄地点', type: 'text' },
      { name: 'scheduledDate', label: '预约日期', type: 'date' },
      { name: 'accessibilityNeeds', label: '无障碍需求', type: 'textarea', placeholder: '拍摄中的特殊无障碍需求' },
    ]
  },
  {
    code: 'deban', name: '德办', fullName: '德办·政务代办',
    category: 'innovation', categoryLabel: '创业赋能',
    description: '残疾人证件代办、政务手续辅助、法律援助申请、流程指引服务，让办事不再困难',
    icon: 'FileText', color: 'bg-gray-700',
    features: ['证件代办', '政务辅助', '法律援助', '流程指引'],
    status: 'active', priority: 93,
    formFields: [
      { name: 'serviceType', label: '代办类型', type: 'select', options: ['残疾证办理', '低保申请', '法律援助', '医保办理', '其他政务'], required: true },
      { name: 'applicant', label: '申请人', type: 'text', required: true },
      { name: 'currentStep', label: '当前步骤', type: 'text', placeholder: '已完成的步骤' },
      { name: 'documentsNeeded', label: '所需材料', type: 'textarea', placeholder: '列出需要准备的材料' },
      { name: 'notes', label: '备注', type: 'textarea', placeholder: '特殊情况与注意事项' },
    ]
  },
  {
    code: 'degongcheng', name: '德工', fullName: '德工·工程施工',
    category: 'innovation', categoryLabel: '创业赋能',
    description: '助残工程项目施工、承包管理、质量监理、进度控制，确保助残工程高质量交付',
    icon: 'Hammer', color: 'bg-stone-600',
    features: ['工程施工', '项目承包', '质量监理', '进度管理'],
    status: 'developing', priority: 94,
    formFields: [
      { name: 'projectName', label: '工程项目', type: 'text', required: true },
      { name: 'projectType', label: '工程类型', type: 'select', options: ['无障碍施工', '装修改造', '设备安装', '基础设施'], required: true },
      { name: 'contractor', label: '承包方', type: 'text' },
      { name: 'startDate', label: '开工日期', type: 'date' },
      { name: 'endDate', label: '竣工日期', type: 'date' },
      { name: 'progress', label: '工程进度(%)', type: 'number' },
      { name: 'qualityNotes', label: '质量记录', type: 'textarea' },
    ]
  },

  // ===== 📝 记录存档类 (records) =====
  {
    code: 'deji2', name: '德记', fullName: '德记·记账记录',
    category: 'records', categoryLabel: '记录存档',
    description: '公益财务记账、收支明细追踪、财务报告生成、审计轨迹保留，让公益财务经得起检验',
    icon: 'Calculator', color: 'bg-emerald-700',
    features: ['公益记账', '收支明细', '财务报告', '审计追踪'],
    status: 'active', priority: 100,
    formFields: [
      { name: 'entryType', label: '记账类型', type: 'select', options: ['收入', '支出', '转账', '调整'], required: true },
      { name: 'amount', label: '金额', type: 'number', required: true },
      { name: 'category', label: '分类', type: 'select', options: ['捐赠收入', '项目支出', '运营费用', '管理费用', '其他'], required: true },
      { name: 'description', label: '摘要', type: 'text', required: true, placeholder: '简要说明收支事由' },
      { name: 'relatedProject', label: '关联项目', type: 'text' },
      { name: 'receiptInfo', label: '票据信息', type: 'textarea', placeholder: '发票/收据编号及备注' },
    ]
  },
  {
    code: 'deshi2', name: '德史', fullName: '德史·历史档案',
    category: 'records', categoryLabel: '记录存档',
    description: '公益历史存档、项目经验沉淀、年度报告汇编、知识传承体系，让善行经验代代相传',
    icon: 'Archive', color: 'bg-brown-600',
    features: ['公益历史', '项目存档', '经验传承', '年度报告'],
    status: 'active', priority: 101,
    formFields: [
      { name: 'archiveType', label: '档案类型', type: 'select', options: ['项目档案', '人物档案', '事件档案', '年度报告', '政策文件'], required: true },
      { name: 'title', label: '档案标题', type: 'text', required: true },
      { name: 'period', label: '档案时期', type: 'text', placeholder: '如：2024年度' },
      { name: 'description', label: '档案描述', type: 'textarea', required: true, placeholder: '档案内容概要与历史价值' },
      { name: 'tags', label: '标签', type: 'text', placeholder: '用逗号分隔标签' },
    ]
  },
  {
    code: 'defu', name: '德服', fullName: '德服·客户服务',
    category: 'records', categoryLabel: '记录存档',
    description: '在线客服应答、投诉受理跟踪、满意度调查分析、工单管理系统，倾听每一个声音',
    icon: 'Headphones', color: 'bg-blue-800',
    features: ['在线客服', '投诉受理', '满意度调查', '工单管理'],
    status: 'active', priority: 102,
    formFields: [
      { name: 'ticketType', label: '工单类型', type: 'select', options: ['咨询', '投诉', '建议', '报障', '其他'], required: true },
      { name: 'subject', label: '工单主题', type: 'text', required: true },
      { name: 'description', label: '详细描述', type: 'textarea', required: true, placeholder: '详细描述您的问题或需求' },
      { name: 'priority', label: '优先级', type: 'select', options: ['低', '中', '高', '紧急'] },
      { name: 'channel', label: '来源渠道', type: 'select', options: ['网页', '电话', '微信', '邮件', '现场'] },
    ]
  },
  {
    code: 'defu2', name: '德扶', fullName: '德扶·帮扶对接',
    category: 'records', categoryLabel: '记录存档',
    description: '一对一精准帮扶、供需智能匹配、效果持续跟踪、结对管理体系，让帮扶更精准更有效',
    icon: 'HandHelping', color: 'bg-green-800',
    features: ['一对一帮扶', '需求匹配', '效果跟踪', '结对管理'],
    status: 'active', priority: 103,
    formFields: [
      { name: 'matchType', label: '帮扶类型', type: 'select', options: ['资金帮扶', '物资帮扶', '技能帮扶', '就业帮扶', '心理帮扶'], required: true },
      { name: 'helper', label: '帮扶方', type: 'text', required: true },
      { name: 'recipient', label: '受助方', type: 'text', required: true },
      { name: 'startDate', label: '帮扶开始日期', type: 'date' },
      { name: 'plan', label: '帮扶计划', type: 'textarea', placeholder: '帮扶的具体内容与目标' },
      { name: 'progress', label: '帮扶进展', type: 'textarea', placeholder: '当前帮扶效果与进展' },
    ]
  },
  {
    code: 'dewei', name: '德维', fullName: '德维·维权法律',
    category: 'records', categoryLabel: '记录存档',
    description: '残疾人权益维护、法律援助申请、维权案例库建设、法律知识普及，捍卫每一份合法权益',
    icon: 'Scale', color: 'bg-purple-700',
    features: ['权益维护', '法律援助', '案例库', '法律普及'],
    status: 'active', priority: 104,
    formFields: [
      { name: 'rightsType', label: '维权类型', type: 'select', options: ['就业歧视', '无障碍权利', '教育权利', '社会保障', '人身安全', '其他'], required: true },
      { name: 'description', label: '维权事项', type: 'textarea', required: true, placeholder: '详细描述权益受侵害的情况' },
      { name: 'legalBasis', label: '法律依据', type: 'text', placeholder: '相关法律法规条款' },
      { name: 'status', label: '处理状态', type: 'select', options: ['咨询中', '调解中', '诉讼中', '已解决'] },
      { name: 'outcome', label: '处理结果', type: 'textarea' },
    ]
  },
]

/**
 * 根据code获取模块定义
 */
export function getDexiModule(code: string): DexiModuleDef | undefined {
  return DEXI_MODULES.find(m => m.code === code)
}

/**
 * 根据分类获取模块列表
 */
export function getDexiModulesByCategory(category: string): DexiModuleDef[] {
  return DEXI_MODULES.filter(m => m.category === category)
}

/**
 * 搜索模块
 */
export function searchDexiModules(query: string): DexiModuleDef[] {
  const q = query.toLowerCase()
  return DEXI_MODULES.filter(m =>
    m.name.includes(q) ||
    m.fullName.includes(q) ||
    m.description.includes(q) ||
    m.features.some(f => f.includes(q)) ||
    m.code.includes(q)
  )
}

/**
 * 获取模块统计
 */
export function getDexiStats() {
  const total = DEXI_MODULES.length
  const active = DEXI_MODULES.filter(m => m.status === 'active').length
  const developing = DEXI_MODULES.filter(m => m.status === 'developing').length
  const planned = DEXI_MODULES.filter(m => m.status === 'planned').length
  const categories = DEXI_CATEGORIES.length
  return { total, active, developing, planned, categories }
}
