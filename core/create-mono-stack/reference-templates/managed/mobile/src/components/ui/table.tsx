import { View, type ViewProps } from "react-native";

type TableProps = ViewProps & {
  className?: string;
};

export function Table({ className, ...props }: TableProps) {
  return (
    <View
      className={`overflow-hidden rounded-lg border border-border ${className ?? ""}`}
      {...props}
    />
  );
}

export function TableHeader({ className, ...props }: TableProps) {
  return <View className={`bg-secondary ${className ?? ""}`} {...props} />;
}

export function TableBody({ className, ...props }: TableProps) {
  return <View className={className} {...props} />;
}

export function TableRow({ className, ...props }: TableProps) {
  return (
    <View
      className={`flex-row items-center border-b border-border p-3 ${className ?? ""}`}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: TableProps) {
  return <View className={`flex-1 ${className ?? ""}`} {...props} />;
}

export function TableHead({ className, ...props }: TableProps) {
  return <View className={`flex-1 ${className ?? ""}`} {...props} />;
}
