export const fieldLabels = {
  name: "作业名称",
  location: "作业地点",
  date: "计划时间",
  leader: "工作负责人",
  members: "作业人员",
  type: "票种分组",
};
export const createDraft = (fields = {}) => ({
  fields: {
    name: "",
    location: "",
    date: "",
    leader: "",
    members: "",
    type: "distribution",
    ...fields,
  },
  confirmed: false,
  reviewed: false,
});
export const updateField = (draft, field, value) => ({
  ...draft,
  fields: { ...draft.fields, [field]: value },
  confirmed: false,
  reviewed: false,
});
export function validateDraft(draft, context) {
  const issues = [];
  for (const field of ["name", "location", "date", "leader", "members"]) {
    const value = draft.fields[field];
    if (typeof value !== "string" || !value.trim())
      issues.push({ field, message: `请补充${fieldLabels[field]}` });
    else if (value.length > 500)
      issues.push({ field, message: `${fieldLabels[field]}请控制在500字以内` });
  }
  const date = draft.fields.date;
  if (
    date &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      Number.isNaN(Date.parse(date)) ||
      new Date(date).toISOString().slice(0, 10) !== date)
  )
    issues.push({ field: "date", message: "计划时间必须为有效日期" });
  if (!["distribution", "live"].includes(draft.fields.type))
    issues.push({ field: "type", message: "请选择已支持的票种分组" });
  if (!context.ruleEnabled)
    issues.push({
      field: "rule",
      message: "演示规则已停用，请到规则审核启用适用规则",
    });
  if (!context.templateEnabled)
    issues.push({
      field: "template",
      message: "对应演示模板已停用，请到模板管理启用",
    });
  return issues;
}
export const confirmDraft = (draft, context) => ({
  ...draft,
  confirmed: validateDraft(draft, context).length === 0,
  reviewed: false,
});
export const reviewDraft = (draft, accepted, context) => ({
  ...draft,
  reviewed: Boolean(
    accepted && draft.confirmed && validateDraft(draft, context).length === 0,
  ),
});
export const canExport = (draft, context) =>
  draft.confirmed &&
  draft.reviewed &&
  validateDraft(draft, context).length === 0;
export function exportRecord(draft, context) {
  if (!canExport(draft, context))
    throw new Error("请先完成字段确认、校验及文档复核");
  return {
    kind: "interface-demo-only",
    formalTicket: false,
    fields: { ...draft.fields },
    ruleVersion: "demo-2026.10",
    templateVersion: "demo-1.0",
    exportedAt: new Date().toISOString(),
  };
}
