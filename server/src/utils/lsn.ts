export function parseLsn(lsn: string) {
  const [hi, lo] = lsn.split("/");

  return (BigInt(`0x${hi}`) << 32n) + BigInt(`0x${lo}`);
}

export function lsnLagBytes(primary: bigint, replica: bigint) {
  return Number(primary > replica ? primary - replica : 0n);
}
