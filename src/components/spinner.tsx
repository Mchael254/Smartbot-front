import { CircularProgress } from '@mui/material';
import type { LoaderProps } from '../types/spinner';



const Spinner = ({ size = 24, color = 'primary', className = '' }: LoaderProps) => {
    return (
        <div className={`flex items-center justify-center ${className}`}>
            <CircularProgress size={size} color={color} />
        </div>
    );
};

export default Spinner