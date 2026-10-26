import React from "react";
import {
  CheckCircle,
  WarningCircle,
  ArrowRight,
  FloppyDisk,
  Info,
} from "@phosphor-icons/react";
import { Badge } from "./ui.jsx";
import { fieldLabels, validateDraft } from "./workflow.mjs";
export function Entry({ draft, onField, onConfirm, onSave, onSample, notice }) {
  const [mode, setMode] = React.useState("form");
  const [text, setText] = React.useState("");
  const [parsed, setParsed] = React.useState(false);
  function parseDemo() {
    const location = text
      .match(/(?:地点为|地点[：:])([^，。；\n]+)/)?.[1]
      ?.trim();
    const date = text.match(/20\d{2}-\d{2}-\d{2}/)?.[0];
    if (location) onField("location", location);
    if (date) onField("date", date);
    setParsed(true);
  }
  return (
    <div className="entry-page">
      <div className="section-heading">
        <div>
          <h2>整理作业任务</h2>
          <p className="muted">补全任务信息，确认字段后进入规则校验。</p>
        </div>
        <button onClick={onSample}>填入演示样例</button>
      </div>
      <div className="entry-grid">
        <section className="entry-main">
          <div className="mode-tabs">
            <button
              className={mode === "form" ? "active" : ""}
              onClick={() => setMode("form")}
            >
              表单录入
            </button>
            <button
              className={mode === "language" ? "active" : ""}
              onClick={() => setMode("language")}
            >
              自然语言
            </button>
          </div>
          {mode === "language" && (
            <div className="language-block">
              <label htmlFor="description">描述作业任务</label>
              <textarea
                id="description"
                maxLength={1000}
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setParsed(false);
                }}
                placeholder="例如：地点为示例线路33号杆，计划时间2026-10-27。"
              />
              <div className="inline-actions">
                <span className="muted">
                  当前演示仅识别地点与 YYYY-MM-DD 日期
                </span>
                <button disabled={!text.trim()} onClick={parseDemo}>
                  提取演示字段
                </button>
              </div>
              {parsed && (
                <p className="inline-note">
                  已尝试提取明确的地点和日期，其余字段请逐项填写；未连接本地模型。
                </p>
              )}
            </div>
          )}
          <label className="field">
            <span>
              票种分组 <em>*</em>
            </span>
            <select
              aria-label="票种分组"
              value={draft.fields.type}
              onChange={(e) => onField("type", e.target.value)}
            >
              <option value="distribution">配电工作票</option>
              <option value="live">10kV带电作业 / 标准化作业书</option>
            </select>
          </label>
          <div className="form-grid">
            {["name", "location", "date", "leader", "members"].map((key) => (
              <label
                className={`field ${key === "members" ? "full" : ""}`}
                key={key}
              >
                <span>
                  {fieldLabels[key]} <em>*</em>
                </span>
                <input
                  aria-label={fieldLabels[key]}
                  type={key === "date" ? "date" : "text"}
                  maxLength={500}
                  value={draft.fields[key]}
                  onChange={(e) => onField(key, e.target.value)}
                  placeholder={`请填写${fieldLabels[key]}`}
                />
              </label>
            ))}
          </div>
          {notice && (
            <div className="error-box" role="alert">
              <WarningCircle size={20} />
              {notice}
            </div>
          )}
          <div className="entry-footer">
            <button onClick={onSave}>
              <FloppyDisk size={18} />
              保存草稿
            </button>
            <button className="primary" onClick={onConfirm}>
              确认字段并校验
              <ArrowRight size={18} />
            </button>
          </div>
        </section>
        <aside className="entry-help">
          <Info size={25} />
          <h3>确认之前，逐项核对</h3>
          <p>输入的信息将填入所选模板。缺失项不会自动补值。</p>
          <ol>
            <li>核对作业地点与计划时间</li>
            <li>填写负责人及作业人员</li>
            <li>确认字段后查看规则校验</li>
            <li>文档复核后再导出</li>
          </ol>
          <div className="source-separator" />
          <Badge>交互演示</Badge>
          <p>
            使用虚构任务和演示规则。正式模型、资料和原模板将在开发阶段接入。
          </p>
        </aside>
      </div>
    </div>
  );
}
export function Validation({
  draft,
  context,
  onBack,
  onContinue,
  onRule,
  onTemplate,
}) {
  const issues = validateDraft(draft, context);
  return (
    <div className="validation-page">
      <div className={`validation-banner ${issues.length ? "warning" : ""}`}>
        {issues.length ? (
          <WarningCircle size={40} />
        ) : (
          <CheckCircle size={40} weight="fill" />
        )}
        <div>
          <h2>
            {issues.length
              ? `发现 ${issues.length} 项待处理信息`
              : "演示校验已通过"}
          </h2>
          <p>
            {issues.length
              ? "完成以下项目后，再次确认字段。"
              : "字段完整、演示规则和模板均可用，可以进入文档复核。"}
          </p>
        </div>
      </div>
      <div className="validation-list">
        {issues.length
          ? issues.map((issue, i) => (
              <div className="validation-row" key={i}>
                <WarningCircle size={22} />
                <span>{issue.message}</span>
                <button
                  className="small-button"
                  onClick={
                    issue.field === "rule"
                      ? onRule
                      : issue.field === "template"
                        ? onTemplate
                        : onBack
                  }
                >
                  前往处理
                </button>
              </div>
            ))
          : [
              "必填字段完整",
              "日期格式有效",
              "票种分组受支持",
              "演示规则已启用",
              "对应演示模板可用",
            ].map((label) => (
              <div className="validation-row" key={label}>
                <CheckCircle size={22} weight="fill" />
                <span>{label}</span>
                <Badge tone="good">通过</Badge>
              </div>
            ))}
      </div>
      <p className="inline-note">
        演示校验只验证界面流程，不代表真实业务合规结论或作业许可。
      </p>
      <div className="entry-footer">
        <button onClick={onBack}>返回字段确认</button>
        <button
          className="primary"
          disabled={issues.length > 0 || !draft.confirmed}
          onClick={onContinue}
        >
          进入文档复核
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
