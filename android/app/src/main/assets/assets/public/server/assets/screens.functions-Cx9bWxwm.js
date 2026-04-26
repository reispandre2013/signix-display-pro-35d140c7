import { c as createLucideIcon } from "./createLucideIcon-DUXbX0Xj.js";
import { c as createSsrRpc } from "./createSsrRpc-BdiZaWN2.js";
import { $ as createServerFn } from "./worker-entry-CFvqOeOX.js";
const __iconNode = [
  ["path", { d: "M12 20v2", key: "1lh1kg" }],
  ["path", { d: "M12 2v2", key: "tus03m" }],
  ["path", { d: "M17 20v2", key: "1rnc9c" }],
  ["path", { d: "M17 2v2", key: "11trls" }],
  ["path", { d: "M2 12h2", key: "1t8f8n" }],
  ["path", { d: "M2 17h2", key: "7oei6x" }],
  ["path", { d: "M2 7h2", key: "asdhe0" }],
  ["path", { d: "M20 12h2", key: "1q8mjw" }],
  ["path", { d: "M20 17h2", key: "1fpfkl" }],
  ["path", { d: "M20 7h2", key: "1o8tra" }],
  ["path", { d: "M7 20v2", key: "4gnj0m" }],
  ["path", { d: "M7 2v2", key: "1i4yhu" }],
  ["rect", { x: "4", y: "4", width: "16", height: "16", rx: "2", key: "1vbyd7" }],
  ["rect", { x: "8", y: "8", width: "8", height: "8", rx: "1", key: "z9xiuo" }],
];
const Cpu = createLucideIcon("cpu", __iconNode);
function normalizeCode(raw) {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}
function validate(input) {
  if (typeof input !== "object" || input === null) throw new Error("Payload inválido.");
  const { code, name, unit_id, orientation } = input;
  if (typeof code !== "string" || normalizeCode(code).length < 6)
    throw new Error("Código de pareamento inválido.");
  if (typeof name !== "string" || name.trim().length < 2)
    throw new Error("Informe um nome para a tela.");
  if (orientation !== "landscape" && orientation !== "portrait")
    throw new Error("Orientação inválida.");
  return {
    code: normalizeCode(code),
    name: name.trim(),
    unit_id: typeof unit_id === "string" && unit_id.length > 0 ? unit_id : null,
    orientation,
  };
}
const claimPairingCode = createServerFn({
  method: "POST",
})
  .inputValidator(validate)
  .handler(createSsrRpc("6386b86a2fd8e8f0fed58b3c0a030b1caf0a3fee64720726efb088e0ae319e6d"));
const createPairingCode = createServerFn({
  method: "POST",
}).handler(createSsrRpc("6cff29d163aa19012939cdafbf4ae5a0c15e38ce51b0a1b7e53a452a8ea4f2f6"));
const checkPairingStatus = createServerFn({
  method: "POST",
})
  .inputValidator((input) => {
    if (typeof input !== "object" || input === null) throw new Error("Payload inválido.");
    const { code } = input;
    if (typeof code !== "string" || code.trim().length < 4) throw new Error("Código inválido.");
    return {
      code: normalizeCode(code),
    };
  })
  .handler(createSsrRpc("96383b5b3a0713d68ef3a1f7fbf2ba0c052d46053ec2454a49203e0382498ae6"));
export { Cpu as C, checkPairingStatus as a, claimPairingCode as b, createPairingCode as c };
