export type ResponseComponentProps = {
  open: boolean;
  handleClose: () => void;
  message: string;
  type: "success" | "error" | "warning";
  autoHideDuration?: number;
};