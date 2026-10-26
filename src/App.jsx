import React from "react";
import {
  FileText,
  FolderOpen,
  ShieldCheck,
  Stack,
  ClockCounterClockwise,
  GearSix,
  Plus,
  CheckCircle,
  Info,
  X,
} from "@phosphor-icons/react";
import { Badge, Modal, Stepper, downloadData } from "./ui.jsx";
import {
  createDraft,
  updateField,
  confirmDraft,
  reviewDraft,
  validateDraft,
  exportRecord,
  fieldLabels,
} from "./workflow.mjs";
import { Review } from "./Review.jsx";
import { Entry, Validation } from "./Generation.jsx";
import {
  Materials,
  Rules,
  Templates,
  History,
  Settings,
} from "./Management.jsx";
const sample = {
  name: "示例线路设备检修",
  location: "示例线路33号杆",
  date: "2026-10-27",
  leader: "示例负责人",
  members: "示例成员甲、示例成员乙",
  type: "distribution",
};
const navigation = [
  ["tickets", "工作票生成", FileText],
  ["materials", "资料管理", FolderOpen],
  ["rules", "规则审核", ShieldCheck],
  ["templates", "模板管理", Stack],
  ["history", "历史票据", ClockCounterClockwise],
  ["settings", "本地设置", GearSix],
];
const initialMaterials = [
  {
    id: 1,
    name: "示例配电资料.pdf",
    format: "PDF",
    size: "128 KB",
    version: "demo-2026.10",
    scope: "配电 / 界面演示",
    status: "demo",
    date: "2026-10-26",
  },
  {
    id: 2,
    name: "示例带电作业资料.docx",
    format: "DOCX",
    size: "64 KB",
    version: "待核验",
    scope: "10kV带电作业 / 界面演示",
    status: "pending",
    date: "2026-10-26",
  },
];
const initialRules = [
  {
    id: "DEMO-001",
    name: "必填字段完整性检查",
    scope: "两类票种",
    source: "内置演示规则集",
    version: "demo-2026.10",
    status: "enabled",
  },
  {
    id: "DEMO-002",
    name: "示例资料适用范围核验",
    scope: "10kV带电作业",
    source: "示例带电作业资料.docx",
    version: "待核验",
    status: "pending",
  },
];
export function App() {
  const [page, setPage] = React.useState("tickets");
  const [stage, setStage] = React.useState("review");
  const [draft, setDraft] = React.useState(() => ({
    ...createDraft(sample),
    confirmed: true,
  }));
  const [materials, setMaterials] = React.useState(initialMaterials);
  const [rules, setRules] = React.useState(initialRules);
  const [templates, setTemplates] = React.useState([
    {
      id: "distribution",
      name: "配电工作票演示模板",
      type: "distribution",
      enabled: true,
    },
    { id: "live", name: "带电作业演示模板", type: "live", enabled: true },
  ]);
  const [history, setHistory] = React.useState([]);
  const [settings, setSettings] = React.useState({
    context: "8192",
    threads: "8",
    model: "",
  });
  const [modal, setModal] = React.useState(null);
  const [toast, setToast] = React.useState("");
  const [notice, setNotice] = React.useState("");
  const [editValue, setEditValue] = React.useState("");
  const [reviewer, setReviewer] = React.useState("");
  const [sourceChecked, setSourceChecked] = React.useState(false);
  const context = {
    ruleEnabled: rules[0].status === "enabled",
    templateEnabled: Boolean(
      templates.find((t) => t.type === draft.fields.type)?.enabled,
    ),
  };
  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 5000);
    return () => clearTimeout(t);
  }, [toast]);
  const notify = (message) => setToast(message);
  function field(key, value) {
    setDraft((previous) => updateField(previous, key, value));
    setNotice("");
  }
  function invalidate() {
    setDraft((previous) => ({
      ...previous,
      confirmed: false,
      reviewed: false,
    }));
    setStage("edit");
  }
  function newDraft(type = "distribution") {
    setDraft(createDraft({ type }));
    setPage("tickets");
    setStage("edit");
    setNotice("");
  }
  function confirm() {
    const issues = validateDraft(draft, context);
    setDraft(confirmDraft(draft, context));
    setStage("check");
    setNotice(issues[0]?.message || "");
  }
  function saveDraft() {
    const id = crypto.randomUUID();
    setHistory((previous) => [
      {
        id,
        name: draft.fields.name || "未命名草稿",
        location: draft.fields.location,
        type: draft.fields.type,
        status: "draft",
        time: new Date().toLocaleString("zh-CN"),
        fields: { ...draft.fields },
      },
      ...previous,
    ]);
    notify("草稿已保存到本次会话的历史票据");
  }
  function exportDemo() {
    try {
      const record = exportRecord(draft, context);
      downloadData(record, "工作票界面演示数据.json");
      setHistory((previous) => [
        {
          id: crypto.randomUUID(),
          name: draft.fields.name,
          location: draft.fields.location,
          type: draft.fields.type,
          status: "exported",
          time: new Date().toLocaleString("zh-CN"),
          fields: { ...draft.fields },
          record,
        },
        ...previous,
      ]);
      setModal(null);
      notify("演示数据已导出，可在历史票据中查看");
    } catch (error) {
      notify(error.message);
    }
  }
  function importMaterials(files) {
    const accepted = files.filter(
      (file) =>
        /\.(pdf|docx?|wps|ofd|ceb)$/i.test(file.name) &&
        file.size <= 50 * 1024 * 1024,
    );
    if (accepted.length)
      setMaterials((previous) => [
        ...accepted.map((file) => ({
          id: crypto.randomUUID(),
          name: file.name,
          format: file.name.split(".").pop().toUpperCase(),
          size: Math.max(1, Math.round(file.size / 1024)) + " KB",
          version: "待核验",
          scope: "适用范围待确认",
          status: "pending",
          date: new Date().toLocaleDateString("sv-SE"),
        })),
        ...previous,
      ]);
    notify(
      "已登记 " +
        accepted.length +
        " 份文件元数据，未读取正文" +
        (accepted.length < files.length
          ? "；部分文件因格式或超过50MB被拒绝"
          : ""),
    );
  }
  function ruleToggle(id) {
    setRules((previous) =>
      previous.map((r) =>
        r.id === id
          ? { ...r, status: r.status === "enabled" ? "disabled" : "enabled" }
          : r,
      ),
    );
    invalidate();
    notify("规则状态已变更，现有草稿需重新确认");
  }
  function templateToggle(id) {
    setTemplates((previous) =>
      previous.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t)),
    );
    invalidate();
    notify("模板状态已变更，现有草稿需重新确认");
  }
  const title =
    page === "tickets"
      ? stage === "review"
        ? "文档复核"
        : stage === "check"
          ? "规则校验"
          : "新建工作票"
      : navigation.find((n) => n[0] === page)?.[1];
  const openEdit = (key) => {
    setEditValue(draft.fields[key]);
    setModal({ type: "edit", key });
  };
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <FileText size={29} weight="fill" />
          <span>工作票助手</span>
        </div>
        <nav aria-label="主导航">
          {navigation.map(([key, label, Icon]) => (
            <button
              key={key}
              className={page === key ? "selected" : ""}
              aria-current={page === key ? "page" : undefined}
              onClick={() => setPage(key)}
            >
              <Icon size={24} weight="regular" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <span className="offline-dot" />
          离线运行
          <button
            aria-label="关于此原型"
            className="icon-button"
            onClick={() => setModal({ type: "about" })}
          >
            <Info size={20} />
          </button>
        </div>
      </aside>
      <main className="main-shell">
        <header className="app-header">
          <div className="header-title">
            <h1>{title}</h1>
            {page === "tickets" && (
              <Badge tone={draft.reviewed ? "good" : "teal"}>
                {stage === "review"
                  ? draft.reviewed
                    ? "已复核草稿"
                    : "待复核草稿"
                  : "任务草稿"}
              </Badge>
            )}
            <span className="prototype-label">交互演示</span>
          </div>
          <div className="header-meta">
            <span>2026-10-26&nbsp; 星期一</span>
            {page !== "tickets" && (
              <button className="small-button" onClick={() => newDraft()}>
                <Plus size={16} />
                新建工作票
              </button>
            )}
          </div>
        </header>
        {page === "tickets" && <Stepper stage={stage} />}
        <div
          className={
            "page-content " + (page !== "tickets" ? "management-content" : "")
          }
          key={page}
        >
          {page === "tickets" &&
            (stage === "review" ? (
              <Review
                draft={draft}
                context={context}
                onReview={(checked) =>
                  setDraft(reviewDraft(draft, checked, context))
                }
                onEdit={openEdit}
                onBack={() => {
                  setStage("edit");
                }}
                onExport={() => setModal({ type: "export" })}
                onSource={() => setModal({ type: "rule", item: rules[0] })}
              />
            ) : stage === "edit" ? (
              <Entry
                draft={draft}
                onField={field}
                onConfirm={confirm}
                onSave={saveDraft}
                onSample={() => {
                  setDraft(createDraft({ ...sample, type: draft.fields.type }));
                  notify("已填入虚构演示样例，请确认后继续");
                }}
                notice={notice}
              />
            ) : (
              <Validation
                draft={draft}
                context={context}
                onBack={() => setStage("edit")}
                onContinue={() => setStage("review")}
                onRule={() => setPage("rules")}
                onTemplate={() => setPage("templates")}
              />
            ))}
          {page === "materials" && (
            <Materials
              items={materials}
              onImport={importMaterials}
              onDetails={(item) => setModal({ type: "material", item })}
            />
          )}{" "}
          {page === "rules" && (
            <Rules
              rules={rules}
              onDetails={(item) => {
                setReviewer("");
                setSourceChecked(false);
                setModal({ type: "rule", item });
              }}
              onToggle={ruleToggle}
            />
          )}{" "}
          {page === "templates" && (
            <Templates
              templates={templates}
              onSelect={newDraft}
              onToggle={templateToggle}
              onDetails={(item) => setModal({ type: "template", item })}
            />
          )}{" "}
          {page === "history" && (
            <History
              items={history}
              onNew={() => newDraft()}
              onOpen={(item) => {
                if (item.status === "exported")
                  setModal({ type: "record", item });
                else {
                  setDraft(createDraft(item.fields));
                  setStage("edit");
                  setPage("tickets");
                }
              }}
            />
          )}{" "}
          {page === "settings" && (
            <Settings
              settings={settings}
              onSave={(values) => {
                setSettings(values);
                notify("设置已保存到本次会话；尚未连接本地推理引擎");
              }}
              onBackup={() => {
                downloadData(
                  { kind: "interface-demo-config", settings },
                  "演示配置.json",
                );
                notify("演示配置已导出");
              }}
              notify={notify}
            />
          )}
        </div>
        <footer className="app-footer">
          <button
            className="text-button"
            onClick={() => setModal({ type: "about" })}
          >
            本地交互原型 · 演示数据
          </button>
          <span>
            {page === "tickets" && stage === "review"
              ? "正式输出将按原模板格式导出"
              : "资料与规则需业务审核后启用"}
          </span>
        </footer>
      </main>
      {toast && (
        <div className="toast" role="status">
          <CheckCircle size={21} />
          <span>{toast}</span>
          <button
            aria-label="关闭提示"
            className="icon-button"
            onClick={() => setToast("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
      {modal && (
        <Modal
          title={
            modal.type === "edit"
              ? "修改" + fieldLabels[modal.key]
              : modal.type === "export"
                ? "导出演示数据"
                : modal.type === "material"
                  ? "资料详情"
                  : modal.type === "rule"
                    ? "规则详情与审核"
                    : modal.type === "template"
                      ? "模板字段映射"
                      : modal.type === "record"
                        ? "导出记录"
                        : "关于此原型"
          }
          onClose={() => setModal(null)}
        >
          {modal.type === "edit" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                field(modal.key, editValue);
                setStage("edit");
                setModal(null);
                notify("字段已修改，请重新确认、校验和复核");
              }}
            >
              <p className="muted">
                修改后，原有字段确认与文档复核结果将失效。
              </p>
              <label className="field">
                <span>{fieldLabels[modal.key]}</span>
                <input
                  autoFocus
                  aria-label={"修改" + fieldLabels[modal.key]}
                  type={modal.key === "date" ? "date" : "text"}
                  maxLength={500}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                />
              </label>
              <div className="modal-actions">
                <button type="button" onClick={() => setModal(null)}>
                  取消
                </button>
                <button className="primary" type="submit">
                  保存修改
                </button>
              </div>
            </form>
          )}
          {modal.type === "export" && (
            <>
              <Badge>交互演示</Badge>
              <p>当前将下载包含已确认字段与版本信息的 JSON 演示数据。</p>
              <p className="muted">
                正式原模板文档生成尚未接入，此文件不是工作票，也不能用于现场作业。
              </p>
              <div className="modal-actions">
                <button onClick={() => setModal(null)}>取消</button>
                <button className="primary" onClick={exportDemo}>
                  下载演示 JSON
                </button>
              </div>
            </>
          )}
          {modal.type === "material" && (
            <>
              <Badge
                tone={modal.item.status === "pending" ? "warn" : "neutral"}
              >
                {modal.item.status === "pending" ? "待核验" : "演示资料"}
              </Badge>
              <dl className="detail-list">
                {[
                  ["文件名称", modal.item.name],
                  ["格式与大小", modal.item.format + " / " + modal.item.size],
                  ["版本", modal.item.version],
                  ["适用范围", modal.item.scope],
                  ["状态说明", "仅元数据登记，不读取文件正文"],
                ].map(([key, value]) => (
                  <div key={key}>
                    <dt>{key}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="inline-note">
                正式资料核验、原文定位和版本发布将在业务开发阶段实现。
              </p>
            </>
          )}
          {modal.type === "rule" && (
            <>
              <Badge>演示条目</Badge>
              <h3>{modal.item.name}</h3>
              <dl className="detail-list">
                <div>
                  <dt>来源</dt>
                  <dd>{modal.item.source}</dd>
                </div>
                <div>
                  <dt>适用范围</dt>
                  <dd>{modal.item.scope}</dd>
                </div>
                <div>
                  <dt>版本</dt>
                  <dd>{modal.item.version}</dd>
                </div>
              </dl>
              <p>
                校验说明：对照已确认字段检查完整性。未包含安全措施或作业许可判断。
              </p>
              {modal.item.status === "pending" ? (
                <>
                  <label className="field">
                    <span>演示审核人</span>
                    <input
                      aria-label="演示审核人"
                      maxLength={40}
                      value={reviewer}
                      onChange={(e) => setReviewer(e.target.value)}
                    />
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={sourceChecked}
                      onChange={(e) => setSourceChecked(e.target.checked)}
                    />
                    已核对演示来源与适用范围
                  </label>
                  <div className="modal-actions">
                    <button onClick={() => setModal(null)}>取消</button>
                    <button
                      className="primary"
                      disabled={!reviewer.trim() || !sourceChecked}
                      onClick={() => {
                        setRules((previous) =>
                          previous.map((r) =>
                            r.id === modal.item.id
                              ? { ...r, status: "enabled", reviewer }
                              : r,
                          ),
                        );
                        invalidate();
                        setModal(null);
                        notify("演示审核已记录，正式审核权限尚未接入");
                      }}
                    >
                      记录演示审核
                    </button>
                  </div>
                </>
              ) : (
                <p className="inline-note">
                  仅演示规则的状态与来源查看，未核验任何客户正式规程。
                </p>
              )}
            </>
          )}
          {modal.type === "template" && (
            <>
              <Badge>演示模板 · demo-1.0</Badge>
              <h3>{modal.item.name}</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>模板字段</th>
                    <th>数据映射</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(fieldLabels).map(([key, label]) => (
                    <tr key={key}>
                      <td>{label}</td>
                      <td>
                        <code>{key}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="inline-note">
                当前预览布局仅作演示；正式输出需采用经确认的原模板及格式。
              </p>
            </>
          )}
          {modal.type === "record" && (
            <>
              <Badge tone="good">演示已导出</Badge>
              <dl className="detail-list">
                <div>
                  <dt>作业名称</dt>
                  <dd>{modal.item.name}</dd>
                </div>
                <div>
                  <dt>导出时间</dt>
                  <dd>{modal.item.time}</dd>
                </div>
                <div>
                  <dt>规则版本</dt>
                  <dd>demo-2026.10</dd>
                </div>
                <div>
                  <dt>文件类型</dt>
                  <dd>演示 JSON · 非正式工作票</dd>
                </div>
              </dl>
              <button
                onClick={() =>
                  downloadData(modal.item.record, "历史演示记录.json")
                }
              >
                下载此演示记录
              </button>
            </>
          )}
          {modal.type === "about" && (
            <>
              <h3>工作票助手 · 方案2</h3>
              <p>
                本原型用于评审六个模块的页面与交互，全部业务记录仅保留在当前会话，刷新即恢复。
              </p>
              <p>
                尚未接入正式本地模型、客户文件解析、审核权限、持久存储及原模板文档生成。
              </p>
              <p className="muted">
                不生成安全措施，不进行签字、签发、审批或作业许可。
              </p>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}
