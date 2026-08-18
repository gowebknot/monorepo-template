import { Switch as NativeSwitch, type SwitchProps } from "react-native";

type Props = SwitchProps & {
  className?: string;
};

export function Switch({ className: _className, ...props }: Props) {
  return (
    <NativeSwitch
      trackColor={{ false: "#d1d5db", true: "#111827" }}
      {...props}
    />
  );
}
