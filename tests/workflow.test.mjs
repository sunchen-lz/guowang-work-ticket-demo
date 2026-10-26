import test from "node:test";
import assert from "node:assert/strict";
import {
  createDraft,
  updateField,
  validateDraft,
  confirmDraft,
  reviewDraft,
  canExport,
  exportRecord,
} from "../src/workflow.mjs";
const fields = {
  name: "示例线路设备检修",
  location: "示例线路33号杆",
  date: "2026-10-27",
  leader: "示例负责人",
  members: "示例成员",
  type: "distribution",
};
const context = { ruleEnabled: true, templateEnabled: true };
test("required missing information blocks confirmation and export", () => {
  const draft = createDraft({ ...fields, leader: "" });
  assert.equal(
    validateDraft(draft, context).some((x) => x.field === "leader"),
    true,
  );
  assert.equal(confirmDraft(draft, context).confirmed, false);
  assert.equal(canExport(draft, context), false);
});
test("separate review is required after confirming fields", () => {
  const draft = confirmDraft(createDraft(fields), context);
  assert.equal(draft.confirmed, true);
  assert.equal(canExport(draft, context), false);
  assert.equal(canExport(reviewDraft(draft, true, context), context), true);
});
test("editing any confirmed field invalidates confirmation and review", () => {
  const reviewed = reviewDraft(
    confirmDraft(createDraft(fields), context),
    true,
    context,
  );
  assert.equal(reviewed.reviewed, true);
  const edited = updateField(reviewed, "location", "另一示例地点");
  assert.equal(edited.confirmed, false);
  assert.equal(edited.reviewed, false);
  assert.equal(canExport(edited, context), false);
});
test("disabling a rule or template blocks reviewed draft export", () => {
  const reviewed = reviewDraft(
    confirmDraft(createDraft(fields), context),
    true,
    context,
  );
  assert.equal(canExport(reviewed, { ...context, ruleEnabled: false }), false);
  assert.equal(
    canExport(reviewed, { ...context, templateEnabled: false }),
    false,
  );
  assert.throws(() =>
    exportRecord(reviewed, { ...context, ruleEnabled: false }),
  );
});
test("malformed dates and unsupported ticket groups block confirmation", () => {
  assert.ok(
    validateDraft(createDraft({ ...fields, date: "2026-02-30" }), context).some(
      (x) => x.field === "date",
    ),
  );
  assert.ok(
    validateDraft(createDraft({ ...fields, type: "unknown" }), context).some(
      (x) => x.field === "type",
    ),
  );
});
test("export produces explicitly marked demo data with original fields preserved", () => {
  const draft = reviewDraft(
    confirmDraft(createDraft(fields), context),
    true,
    context,
  );
  const record = exportRecord(draft, context);
  assert.equal(record.kind, "interface-demo-only");
  assert.equal(record.fields.name, "示例线路设备检修");
  assert.equal(record.formalTicket, false);
});
