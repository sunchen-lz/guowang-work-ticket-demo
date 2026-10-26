import React from "react";
import {
  FileText,
  CaretLeft,
  CaretRight,
  Minus,
  Plus,
  CornersOut,
  ArrowSquareOut,
  CheckCircle,
  PencilSimple,
} from "@phosphor-icons/react";
import { Badge, Modal } from "./ui.jsx";
import { fieldLabels, canExport } from "./workflow.mjs";
export function Review({
  draft,
  context,
  onReview,
  onEdit,
  onBack,
  onExport,
  onSource,
}) {
  const [tab, setTab] = React.useState("fields");
  const [page, setPage] = React.useState(1);
  const [zoom, setZoom] = React.useState(100);
  const [expanded, setExpanded] = React.useState(false);
  const document = (
    <article className="paper" style={{ width: `${zoom}%` }}>
      <h2>{page === 1 ? "示例工作票" : "人员信息"}</h2>
      <p className="paper-subtitle">演示模板，非正式票据</p>
      <dl>
        {(page === 1
          ? ["name", "location", "date"]
          : ["leader", "members", "type"]
        ).map((key) => (
          <div key={key}>
            <dt>{fieldLabels[key]}</dt>
            <dd>
              {key === "type"
                ? draft.fields.type === "live"
                  ? "10kV带电作业"
                  : "配电工作票"
                : draft.fields[key]}
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
  return (
    <div className="review-layout">
      <section className="document-column" aria-label="文档预览">
        <div className="preview-toolbar">
          <FileText size={21} />
          <span>页面 {page} / 2</span>
          <button
            aria-label="上一页"
            className="icon-button"
            disabled={page === 1}
            onClick={() => setPage(1)}
          >
            <CaretLeft />
          </button>
          <button
            aria-label="下一页"
            className="icon-button"
            disabled={page === 2}
            onClick={() => setPage(2)}
          >
            <CaretRight />
          </button>
          <div className="toolbar-spacer" />
          <button
            aria-label="缩小"
            className="icon-button"
            disabled={zoom <= 75}
            onClick={() => setZoom(zoom - 25)}
          >
            <Minus />
          </button>
          <span className="zoom-value">{zoom}%</span>
          <button
            aria-label="放大"
            className="icon-button"
            disabled={zoom >= 150}
            onClick={() => setZoom(zoom + 25)}
          >
            <Plus />
          </button>
          <button
            aria-label="适应页面"
            className="icon-button"
            onClick={() => setZoom(100)}
          >
            <CornersOut />
          </button>
          <button
            aria-label="展开预览"
            className="icon-button"
            onClick={() => setExpanded(true)}
          >
            <ArrowSquareOut />
          </button>
        </div>
        <div className="paper-canvas">{document}</div>
      </section>
      <section className="review-panel">
        <div className="tabs">
          <button
            className={tab === "fields" ? "active" : ""}
            onClick={() => setTab("fields")}
          >
            字段核对
          </button>
          <button
            className={tab === "sources" ? "active" : ""}
            onClick={() => setTab("sources")}
          >
            来源依据
          </button>
        </div>
        {tab === "fields" ? (
          <>
            <div className="review-table-wrap">
              <table className="review-table">
                <thead>
                  <tr>
                    <th>字段名称</th>
                    <th>当前值</th>
                    <th>来源状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {["name", "location", "date"].map((key) => (
                    <tr key={key}>
                      <td>{fieldLabels[key]}</td>
                      <td>{draft.fields[key]}</td>
                      <td>
                        <Badge tone="good">已确认</Badge>
                      </td>
                      <td>
                        <button
                          className="small-button"
                          onClick={() => onEdit(key)}
                        >
                          修改字段
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <section className="source-summary">
              <h3>来源信息</h3>
              <p>演示规则版本：2026.10</p>
              <p className="muted">实际资料需业务审核后启用</p>
            </section>
          </>
        ) : (
          <div className="sources-pane">
            <Badge>演示数据</Badge>
            <h3>演示字段校验规则</h3>
            <p>来源：原型内置演示集 / 必填字段约束</p>
            <p>版本：demo-2026.10 · 适用于当前票种</p>
            <p className="muted">
              这里只演示来源追溯方式；正式条款、页码及安全措施尚未导入。
            </p>
            <button className="small-button" onClick={onSource}>
              查看规则详情
            </button>
            <div className="source-separator" />
            <h3>演示模板映射</h3>
            <p>作业名称 → name</p>
            <p>作业地点 → location</p>
            <p>计划时间 → date</p>
          </div>
        )}
        <div className="review-actions">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={draft.reviewed}
              onChange={(e) => onReview(e.target.checked)}
            />
            <span>我已对照现场信息和原始资料复核</span>
          </label>
          <div className="action-buttons">
            <button onClick={onBack}>返回修改</button>
            <button
              className="primary"
              disabled={!canExport(draft, context)}
              onClick={onExport}
            >
              导出
            </button>
          </div>
        </div>
      </section>
      {expanded && (
        <Modal title="文档预览 · 演示模板" onClose={() => setExpanded(false)}>
          <div className="expanded-document">{document}</div>
        </Modal>
      )}
    </div>
  );
}
