export type ModalProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
};