import { Snackbar, Alert} from "@mui/material";
import type { ResponseComponentProps } from "../types/response";




function ResponseComponent(props: ResponseComponentProps) {
  const { 
    open, 
    handleClose, 
    message, 
    type, 
    autoHideDuration = 3000 
  } = props;

  return (
    <Snackbar 
      open={open} 
      autoHideDuration={autoHideDuration} 
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert onClose={handleClose} severity={type} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
}

export default ResponseComponent;