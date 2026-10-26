import React from "react";
import {
  UploadSimple,
  FileText,
  FolderOpen,
  ShieldCheck,
  ArrowSquareOut,
  DownloadSimple,
  Plus,
  GearSix,
  Cpu,
  Info,
} from "@phosphor-icons/react";
import { Badge, Search, Empty } from "./ui.jsx";
export function Materials({ items, onImport, onDetails }) {
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState("all");
  const input = React.useRef(null);
  const filtered = items.filter(
    (item) =>
      item.name.includes(search) &&
      (filter === "all" || item.status === filter),
  );
  return (
    <div className="management-page">
      <div className="section-heading">
        <div>
          <h2>本地资料库</h2>
          <p className="muted">保留原始文件，核验版本与适用范围后再启用。</p>
        </div>
        <button className="primary" onClick={() => input.current.click()}>
          <UploadSimple size={18} />
          导入资料
        </button>
        <input
          ref={input}
          hidden
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.wps,.ofd,.ceb"
          onChange={(e) => {
            onImport([...e.target.files]);
            e.target.value = "";
          }}
        />
      </div>
      <div className="notice-strip">
        <Info size={19} />
        <span>
          原型只登记文件名称与大小，不解析或上传正文；以下现有条目均为演示数据。
        </span>
      </div>
      <div className="list-toolbar">
        <Search
          value={search}
          onChange={setSearch}
          placeholder="搜索资料名称…"
        />
        <select
          aria-label="资料状态"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">全部状态</option>
          <option value="demo">演示已核验</option>
          <option value="pending">待核验</option>
        </select>
        <span className="muted">{filtered.length} 份资料</span>
      </div>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>资料名称</th>
              <th>格式 / 大小</th>
              <th>版本</th>
              <th>状态</th>
              <th>登记时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td>
                  <span className="file-name">
                    <FileText size={25} />
                    <span>
                      {item.name}
                      <small>{item.scope}</small>
                    </span>
                  </span>
                </td>
                <td>
                  {item.format}
                  <small>{item.size}</small>
                </td>
                <td>{item.version}</td>
                <td>
                  <Badge tone={item.status === "demo" ? "good" : "warn"}>
                    {item.status === "demo" ? "演示已核验" : "待核验"}
                  </Badge>
                </td>
                <td>{item.date}</td>
                <td>
                  <button
                    className="text-button"
                    onClick={() => onDetails(item)}
                  >
                    查看详情
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && <Empty>没有匹配的资料，试试其他关键词。</Empty>}
      </div>
      <p className="bottom-note">
        文件不会因导入而自动成为生效依据。正式版本需由业务人员审核。
      </p>
    </div>
  );
}
export function Rules({ rules, onDetails, onToggle }) {
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState("all");
  const filtered = rules.filter(
    (r) => r.name.includes(search) && (filter === "all" || r.status === filter),
  );
  return (
    <div className="management-page">
      <div className="section-heading">
        <div>
          <h2>规则审核与版本</h2>
          <p className="muted">每条规则都应具备来源、适用范围和审核记录。</p>
        </div>
        <Badge>演示规则集 · 2026.10</Badge>
      </div>
      <div className="notice-strip">
        <ShieldCheck size={20} />
        <span>当前仅演示审核操作；真实规则审核权限及来源条款尚未接入。</span>
      </div>
      <div className="list-toolbar">
        <Search
          value={search}
          onChange={setSearch}
          placeholder="搜索规则名称…"
        />
        <select
          aria-label="规则状态"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">全部规则</option>
          <option value="enabled">已启用</option>
          <option value="pending">待审核</option>
          <option value="disabled">已停用</option>
        </select>
      </div>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>规则名称</th>
              <th>适用范围</th>
              <th>来源</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((rule) => (
              <tr key={rule.id}>
                <td>
                  <strong>{rule.name}</strong>
                  <small>{rule.id}</small>
                </td>
                <td>{rule.scope}</td>
                <td>
                  {rule.source}
                  <small>{rule.version}</small>
                </td>
                <td>
                  <Badge
                    tone={
                      rule.status === "enabled"
                        ? "good"
                        : rule.status === "pending"
                          ? "warn"
                          : "neutral"
                    }
                  >
                    {rule.status === "enabled"
                      ? "已启用（演示）"
                      : rule.status === "pending"
                        ? "待审核"
                        : "已停用"}
                  </Badge>
                </td>
                <td>
                  <div className="row-actions">
                    <button
                      className="text-button"
                      onClick={() => onDetails(rule)}
                    >
                      {rule.status === "pending" ? "审核详情" : "查看详情"}
                    </button>
                    {rule.status !== "pending" && (
                      <button
                        className="text-button"
                        onClick={() => onToggle(rule.id)}
                      >
                        {rule.status === "enabled" ? "停用" : "启用"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && <Empty>没有匹配的规则。</Empty>}
      </div>
      <p className="bottom-note">
        规则状态变更后，现有草稿需要重新确认、校验和复核。
      </p>
    </div>
  );
}
export function Templates({ templates, onSelect, onToggle, onDetails }) {
  return (
    <div className="management-page">
      <div className="section-heading">
        <div>
          <h2>模板与字段映射</h2>
          <p className="muted">正式输出沿用已有模板格式，每个版本单独核验。</p>
        </div>
      </div>
      <div className="notice-strip">
        <Info size={19} />
        <span>以下为界面演示模板。尚未接入客户原模板，不能生成正式票据。</span>
      </div>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>模板名称</th>
              <th>票种分组</th>
              <th>版本</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((t) => (
              <tr key={t.id}>
                <td>
                  <span className="file-name">
                    <FileText size={26} />
                    <span>
                      {t.name}
                      <small>演示映射 · 非正式模板</small>
                    </span>
                  </span>
                </td>
                <td>{t.type === "live" ? "10kV带电作业" : "配电工作票"}</td>
                <td>demo-1.0</td>
                <td>
                  <Badge tone={t.enabled ? "good" : "neutral"}>
                    {t.enabled ? "演示可用" : "已停用"}
                  </Badge>
                </td>
                <td>
                  <div className="row-actions">
                    <button
                      className="text-button"
                      onClick={() => onDetails(t)}
                    >
                      字段映射
                    </button>
                    <button
                      className="text-button"
                      disabled={!t.enabled}
                      onClick={() => onSelect(t.type)}
                    >
                      新建草稿
                    </button>
                    <button
                      className="text-button"
                      onClick={() => onToggle(t.id)}
                    >
                      {t.enabled ? "停用" : "启用"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <section className="plain-section">
        <h3>原模板接入要求</h3>
        <div className="requirements-grid">
          <div>
            <h4>保留格式与版式</h4>
            <p>表格、分页、页眉页脚与原文件保持一致。</p>
          </div>
          <div>
            <h4>逐项确认映射</h4>
            <p>字段位置和溢出处理需由业务人员核验。</p>
          </div>
          <div>
            <h4>试填后启用</h4>
            <p>每种票种与版本通过人工版式验收。</p>
          </div>
        </div>
      </section>
    </div>
  );
}
export function History({ items, onOpen, onNew }) {
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState("all");
  const filtered = items.filter(
    (item) =>
      item.name.includes(search) &&
      (filter === "all" || item.status === filter),
  );
  return (
    <div className="management-page">
      <div className="section-heading">
        <div>
          <h2>历史票据</h2>
          <p className="muted">查看当前演示会话中的草稿与导出记录。</p>
        </div>
        <button className="primary" onClick={onNew}>
          <Plus size={18} />
          新建草稿
        </button>
      </div>
      <div className="list-toolbar">
        <Search
          value={search}
          onChange={setSearch}
          placeholder="搜索作业名称…"
        />
        <select
          aria-label="票据状态"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">全部状态</option>
          <option value="draft">草稿</option>
          <option value="exported">演示已导出</option>
        </select>
      </div>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>作业名称</th>
              <th>票种分组</th>
              <th>状态</th>
              <th>记录时间</th>
              <th>资料 / 模板版本</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.name}</strong>
                  <small>{item.location || "地点待补充"}</small>
                </td>
                <td>{item.type === "live" ? "10kV带电作业" : "配电工作票"}</td>
                <td>
                  <Badge tone={item.status === "exported" ? "good" : "neutral"}>
                    {item.status === "exported" ? "演示已导出" : "草稿"}
                  </Badge>
                </td>
                <td>{item.time}</td>
                <td>demo-2026.10 / 1.0</td>
                <td>
                  <button className="text-button" onClick={() => onOpen(item)}>
                    {item.status === "exported" ? "查看记录" : "继续填写"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && (
          <Empty>还没有匹配记录，可以先保存一份草稿。</Empty>
        )}
      </div>
      <p className="bottom-note">
        本原型不持久保存业务数据，刷新页面后恢复演示状态。
      </p>
    </div>
  );
}
export function Settings({ settings, onSave, onBackup, notify }) {
  const [form, setForm] = React.useState(settings);
  const [file, setFile] = React.useState(null);
  const picker = React.useRef(null);
  return (
    <div className="management-page settings-page">
      <div className="section-heading">
        <div>
          <h2>本地模型与设置</h2>
          <p className="muted">所有正式运行组件均部署在本机。</p>
        </div>
        <Badge>原型模式</Badge>
      </div>
      <section className="settings-section">
        <div className="settings-icon">
          <Cpu size={28} />
        </div>
        <div className="settings-content">
          <h3>本地模型</h3>
          <p className="muted">
            选择 GGUF 模型文件；原型仅读取文件名，不加载推理引擎。
          </p>
          <div className="model-file">
            <FileText size={25} />
            <span>{file?.name || form.model || "尚未选择模型文件"}</span>
            <button onClick={() => picker.current.click()}>选择文件</button>
            <input
              hidden
              ref={picker}
              type="file"
              accept=".gguf"
              onChange={(e) => {
                const f = e.target.files[0];
                if (f && f.name.toLowerCase().endsWith(".gguf")) {
                  setFile(f);
                  setForm({ ...form, model: f.name });
                } else if (f) notify("请选择 .gguf 模型文件");
                e.target.value = "";
              }}
            />
          </div>
          <div className="form-grid">
            <label className="field">
              <span>上下文长度</span>
              <select
                value={form.context}
                onChange={(e) => setForm({ ...form, context: e.target.value })}
              >
                <option>4096</option>
                <option>8192</option>
                <option>16384</option>
              </select>
            </label>
            <label className="field">
              <span>CPU 线程</span>
              <select
                value={form.threads}
                onChange={(e) => setForm({ ...form, threads: e.target.value })}
              >
                <option>4</option>
                <option>8</option>
                <option>16</option>
              </select>
            </label>
          </div>
          <p className="inline-note">
            未连接模型服务。字段提取演示不代表本地模型效果。
          </p>
        </div>
      </section>
      <section className="settings-section">
        <div className="settings-icon">
          <FolderOpen size={28} />
        </div>
        <div className="settings-content">
          <h3>数据与备份</h3>
          <p className="muted">
            当前数据仅保留在本次页面会话，正式版将采用本地存储。
          </p>
          <button onClick={onBackup}>
            <DownloadSimple size={18} />
            导出演示配置
          </button>
          <p className="fine-print">
            仅导出原型配置，不包含模型、原始资料或票据数据库。
          </p>
        </div>
      </section>
      <div className="settings-bottom">
        <span className="muted">设置仅在本次会话生效</span>
        <button className="primary" onClick={() => onSave(form)}>
          保存设置
        </button>
      </div>
    </div>
  );
}
