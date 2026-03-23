import { useStore } from '../../store/useStore';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider,
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Maximize, ZoomIn, Info } from 'lucide-react';

export const StatusBar = () => {
  const { zoomLevel, setZoomLevel, selectedElementIds, canvasElements } = useStore();
  
  const selectedElements = canvasElements.filter(el => selectedElementIds.includes(el.id));
  const primaryElement = selectedElements[0];
  
  const zoomOptions = [0.25, 0.5, 1.0, 2.0];

  return (
    <TooltipProvider>
      <footer className="h-10 absolute bottom-4 left-6 right-6 bg-white/80 backdrop-blur-md rounded-xl border border-slate-200/60 shadow-lg flex items-center justify-between px-6 text-[11px] text-slate-500 font-medium z-[100] transition-all hover:bg-white/95">
        
        {/* Left Side: Selection Details */}
        <div className="flex items-center gap-6">
          {selectedElements.length === 0 ? (
            <div className="flex items-center gap-2 text-slate-400 italic">
               <Info className="w-3 h-3" />
               <span>Ready / No Selection</span>
               <Separator orientation="vertical" className="h-4" />
               <span>Grid: 20px / Adaptive</span>
            </div>
          ) : selectedElements.length === 1 ? (
             <div className="flex items-center gap-4">
                <Badge variant="secondary" className="text-[9px] px-1 py-0 bg-blue-50 text-blue-600 border-blue-100 uppercase font-bold">
                   {primaryElement.type}
                </Badge>
                <div className="flex items-center gap-2">
                   <span className="text-slate-400">X:</span>
                   <span className="text-slate-900 font-bold">{Math.round(primaryElement.x)}px</span>
                </div>
                <div className="flex items-center gap-2">
                   <span className="text-slate-400">Y:</span>
                   <span className="text-slate-900 font-bold">{Math.round(primaryElement.y)}px</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-2">
                   <span className="text-slate-400">W:</span>
                   <span className="text-slate-900 font-bold">{Math.round(primaryElement.width)}px</span>
                </div>
                <div className="flex items-center gap-2">
                   <span className="text-slate-400">H:</span>
                   <span className="text-slate-900 font-bold">{Math.round(primaryElement.height)}px</span>
                </div>
             </div>
          ) : (
             <div className="flex items-center gap-2">
                <Badge className="bg-blue-600 hover:bg-blue-600 text-white shadow-sm px-1.5 h-4">
                   {selectedElements.length}
                </Badge>
                <span className="text-slate-900 font-bold uppercase tracking-wider text-[10px]">Elements Selected</span>
             </div>
          )}
        </div>
        
        {/* Right Side: Environment Controls */}
        <div className="flex items-center gap-4">
          <Button variant="link" className="h-auto p-0 text-slate-400 hover:text-slate-900 text-[11px]">Drafting Feedback</Button>
          <Separator orientation="vertical" className="h-4" />
          
          <DropdownMenu modal={false}>
            <Tooltip>
               <TooltipTrigger>
                  <DropdownMenuTrigger>
                    <button className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer outline-none group border border-transparent hover:border-slate-200">
                       <ZoomIn className="w-3 h-3 text-slate-400 group-hover:text-blue-600" />
                       <span className="font-mono text-slate-700 font-bold min-w-[32px]">
                          {Math.round(zoomLevel * 100)}%
                       </span>
                    </button>
                  </DropdownMenuTrigger>
               </TooltipTrigger>
               <TooltipContent side="top">
                  <span>Zoom Level Options</span>
               </TooltipContent>
            </Tooltip>
            
            <DropdownMenuContent align="end" className="w-32 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border-slate-200/60 p-1 mb-2">
               {zoomOptions.map(opt => (
                  <DropdownMenuItem 
                    key={opt}
                    onClick={() => setZoomLevel(opt)}
                    className={`text-[11px] font-bold px-3 py-2 rounded-lg cursor-pointer ${
                      zoomLevel === opt ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{opt * 100}%</span>
                    {zoomLevel === opt && <div className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full" />}
                  </DropdownMenuItem>
               ))}
               <Separator className="my-1 mx-1" />
               <DropdownMenuItem 
                 onClick={() => setZoomLevel(1)}
                 className="text-[11px] text-slate-500 hover:text-slate-900 px-3 py-2"
               >
                 Auto-fit Canvas
               </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg">
             <Maximize className="w-3.5 h-3.5" />
          </Button>
        </div>
      </footer>
    </TooltipProvider>
  );
};

export default StatusBar;
