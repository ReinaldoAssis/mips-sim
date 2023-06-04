import { HardwareProps, Pin } from "./Hardware";

export default function Wire({
  pinA,
  pinB,
  components,
  color,
  thickness,
}: {
  pinA: Pin;
  pinB: Pin;
  components: Array<HardwareProps>;
  color?: string;
  thickness?: number;
}) {}
