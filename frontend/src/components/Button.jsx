import {ArrowRight} from 'lucide-react';
export default function Button({children,onClick,variant='outline',type='button'}){return <button type={type} onClick={onClick} className={`lux-btn ${variant}`}><span>{children}</span><ArrowRight size={15}/></button>}
