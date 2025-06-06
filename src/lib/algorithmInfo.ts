export interface AlgorithmInfo {
  title: string;
  description: string;
  example: string;
  sampleData: string;
  resultExample: string;
}

export const algorithmInfo: Record<string, AlgorithmInfo> = {
  frequency: {
    title: '频数分析',
    description: '统计数据中各值出现的频次，用于查看离散变量的分布情况。',
    example: '例如调查问卷中选项A、B、C的出现次数。',
    sampleData: `value\nA\nB\nA\nC\nA`,
    resultExample: `A: 3\nB: 1\nC: 1`
  },
  crosstab: {
    title: '交叉表分析',
    description: '用于分析两个或多个分类变量之间的关系。',
    example: '例如比较性别与购买意向之间的联系。',
    sampleData: `gender,intent\nM,Yes\nF,No\nM,Yes`,
    resultExample: '生成包含各组合频次的交叉表'
  },
  descriptives: {
    title: '描述性统计',
    description: '计算均值、标准差、最大值、最小值等基本统计量。',
    example: '适用于快速了解数据的集中趋势和离散程度。',
    sampleData: `score\n12\n15\n11\n20`,
    resultExample: '返回均值、标准差等统计指标'
  },
  correlation: {
    title: '相关性分析',
    description: '评估两个连续变量之间的线性相关程度。',
    example: '例如收入与消费支出之间的关系。',
    sampleData: `income,spend\n10,8\n12,9\n9,6`,
    resultExample: '输出皮尔逊相关系数等数值'
  },
  regression: {
    title: '线性回归分析',
    description: '建立自变量与因变量之间的线性模型，用于预测和解释。',
    example: '根据面积和位置预测房价。',
    sampleData: `price,area\n100,80\n120,100\n150,120`,
    resultExample: '给出回归系数、R^2等结果'
  },
  anova: {
    title: '方差分析',
    description: '比较三个及以上组的均值是否存在显著差异。',
    example: '比较不同教学方法下考试成绩的差异。',
    sampleData: `method,score\nA,80\nB,75\nA,85`,
    resultExample: '返回F值和p值等信息'
  },
  ttest: {
    title: 'T检验',
    description: '检验两个样本均值的差异是否显著。',
    example: '比较新旧药物的治疗效果。',
    sampleData: `group,score\nnew,5\nold,3\nnew,6`,
    resultExample: '返回t值和p值'
  },
  reliability: {
    title: '信度分析',
    description: '评估问卷或量表内部一致性，常用Cronbach α系数。',
    example: '用于验证问卷题项是否可靠。',
    sampleData: `q1,q2,q3\n3,4,5\n4,4,4\n5,5,5`,
    resultExample: '输出Cronbach α值'
  }
};
