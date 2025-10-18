import Modal from '@mui/joy/Modal';
import ModalClose from '@mui/joy/ModalClose';
import Typography from '@mui/joy/Typography';
import Sheet from '@mui/joy/Sheet';import type { ModalProps } from '../types/modal';



export default function BasicModal({ open, setOpen, title = "Modal Title", description, children }: ModalProps) {

    return (
        <Modal
            aria-labelledby="modal-title"
            aria-describedby="modal-desc"
            open={open}
            onClose={() => setOpen(false)}
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
            <Sheet
                variant="outlined"
                sx={{ maxWidth: 500, minWidth:400, borderRadius: 'md', p: 3, boxShadow: 'lg' }}
            >
                <ModalClose variant="plain" sx={{ m: 1 }} onClick={() => setOpen(false)} />
                <Typography
                    component="h2"
                    id="modal-title"
                    level="h4"
                    textColor="inherit"
                    sx={{ fontWeight: 'lg', mb: 1 }}
                >
                    {title}
                </Typography>
                {description && (
                    <Typography id="modal-desc" textColor="text.tertiary" sx={{ mb: 2 }}>
                        {description}
                    </Typography>
                )}
                {children}
            </Sheet>
        </Modal>
    );
}