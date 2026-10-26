import React from "react";
import {
  CheckCircle,
  WarningCircle,
  X,
  MagnifyingGlass,
  FileText,
} from "@phosphor-icons/react";
export function Badge({ children, tone = "neutral" }) {
  return (
    <span className={`badge ${tone}`}>
      {tone === "good" && <CheckCircle size={15} weight="fill" />}
      {tone === "warn" && <WarningCircle size={15} weight="fill" />}
      {children}
    </span>
  );
}
export function Search({ value, onChange, placeholder = "搜索名称…" }) {
  return (
    <label className="search">
      <MagnifyingGlass size={18} />
      <input
        aria-label={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
export function Modal({ title, children, onClose }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const old = document.activeElement;
    const dialog = ref.current;
    dialog.showModal();
    const cancel = () => onClose();
    dialog.addEventListener("cancel", cancel);
    return () => {
      dialog.removeEventListener("cancel", cancel);
      dialog.close();
      old?.focus();
    };
  }, []);
  return (
    <dialog ref={ref} className="modal" aria-label={title}>
      <header>
        <h2>{title}</h2>
        <button aria-label="关闭弹窗" className="icon-button" onClick={onClose}>
          <X size={21} />
        </button>
      </header>
      {children}
    </dialog>
  );
}
export function Empty({ children }) {
  return (
    <div className="empty">
      <FileText size={40} weight="light" />
      <p>{children}</p>
    </div>
  );
}
export function Stepper({ stage }) {
  const current = stage === "review" ? 2 : stage === "check" ? 1 : 0;
  return (
    <div className="stepper">
      {["字段已确认", "校验已通过", "文档待复核"].map((label, i) => (
        <React.Fragment key={label}>
          {i > 0 && (
            <span className={`step-line ${i <= current ? "complete" : ""}`} />
          )}
          <span className={`step ${i <= current ? "current" : ""}`}>
            <span className="step-dot">
              {i < current ? <CheckCircle size={27} weight="fill" /> : i + 1}
            </span>
            {i === 0 && current === 0
              ? "录入与字段确认"
              : i === 1 && current < 2
                ? "规则校验"
                : label}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}
export function downloadData(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
