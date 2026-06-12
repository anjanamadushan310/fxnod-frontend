/**
 * Single source of truth for contract type metadata.
 *
 * Order matters — drives both the tab bar and the URL `?type=` param.
 * Adding a new contract type later means adding one row + a panel file.
 */

export type ContractTypeId =
  | "rise_fall"
  | "accumulators"
  | "multipliers"
  | "turbos"
  | "vanillas"
  | "higher_lower"
  | "touch_no_touch"
  | "matches_differs"
  | "over_under"
  | "even_odd";

export interface ContractType {
  id: ContractTypeId;
  label: string;
  /** Show a small fire glyph next to the label (Deriv's "trending" hint). */
  trending?: boolean;
}

export const CONTRACT_TYPES: ContractType[] = [
  { id: "rise_fall", label: "Rise/Fall", trending: true },
  { id: "accumulators", label: "Accumulators", trending: true },
  { id: "multipliers", label: "Multipliers" },
  { id: "turbos", label: "Turbos" },
  { id: "vanillas", label: "Vanillas" },
  { id: "higher_lower", label: "Higher/Lower" },
  { id: "touch_no_touch", label: "Touch/No Touch" },
  { id: "matches_differs", label: "Matches/Differs" },
  { id: "over_under", label: "Over/Under" },
  { id: "even_odd", label: "Even/Odd" },
];
