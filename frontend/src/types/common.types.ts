import type { BillModel } from "@/models/bill.models";
import type { QuotationModel } from "@/models/quotation.models";

export interface HeadingProps {
    heading: string;
}

export interface BillPreviewModalProps {
    open: boolean;
    bill: BillModel | null;
    onClose: () => void;
}

export interface ProfileOverlayProps {
    open: boolean;
    onClose: () => void;
}

export interface QuotationTemplateModalProps {
    open: boolean;
    quotation: QuotationModel | null;
    onClose: () => void;
    onQuotationUpdated?: (updated: QuotationModel) => void;
}

export interface RenderSvgIconProps {
    svgString?: string | null;
    size?: number;
    color?: string;
}