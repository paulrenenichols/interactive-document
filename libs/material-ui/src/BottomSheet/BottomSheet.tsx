import * as React from 'react';
import { Portal } from '../Portal';
import { Backdrop } from '../Backdrop';
import { Slide } from '../Transitions';

export interface BottomSheetProps
  extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose: () => void;
  maxHeight?: number | string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  open,
  onClose,
  maxHeight = '60vh',
  className = '',
  children,
  style,
  ...props
}) => {
  if (!open) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-50">
        <Backdrop open={open} onClick={onClose} />
        <Slide in={open} direction="up">
          <div
            className="fixed inset-x-0 bottom-0 z-50 flex justify-center"
          >
            <div
              className={`w-full max-w-md rounded-t-radius-large bg-bg-primary p-3 shadow-lg dark:bg-bg-primary ${className}`.trim()}
              style={{ maxHeight, ...style }}
              {...props}
            >
              <div className="mx-auto mb-2 h-1 w-10 rounded-radius-full bg-border-default dark:bg-border-default" />
              <div className="overflow-y-auto">{children}</div>
            </div>
          </div>
        </Slide>
      </div>
    </Portal>
  );
};

BottomSheet.displayName = 'BottomSheet';

