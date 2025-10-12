import { formatUnits } from 'viem';

export function formatSbc(value: bigint): string {
  return parseFloat(formatUnits(value, 18)).toFixed(3);
}
