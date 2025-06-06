export const analysisConfig = {
  frequency: {
    title: '频数分析',
    description: '统计数据中各值出现的频次',
    example: '适用于分析问卷中选择题的分布情况'
  },
  crosstab: {
    title: '交叉表分析',
    description: '分析两个或多个分类变量之间的关系',
    example: '适用于分析性别与购买偏好的关系'
  },
  descriptives: {
    title: '描述性统计',
    description: '计算均值、标准差、最大值、最小值等基本统计量',
    example: '适用于了解数据的基本分布特征'
  },
  correlation: {
    title: '相关性分析',
    description: '分析变量之间的线性相关关系',
    example: '适用于分析收入与消费支出的关系'
  },
  regression: {
    title: '线性回归分析',
    description: '建立因变量与自变量之间的线性关系模型',
    example: '适用于预测房价与面积、位置等因素的关系'
  },
  anova: {
    title: '方差分析',
    description: '比较多个组之间的均值差异',
    example: '适用于比较不同教学方法的效果差异'
  },
  ttest: {
    title: 'T检验',
    description: '比较两个组的均值是否存在显著差异',
    example: '适用于比较两种药物的治疗效果'
  },
  reliability: {
    title: '信度分析',
    description: '评估问卷或量表的内部一致性',
    example: '适用于验证问卷的可靠性'
  }
}; 