import { Box } from "@mui/material";
import { CSSProperties } from '@mui/material';


type OverlayBoxProps = {
  sharedStyles: CSSProperties;
  dangerouslySetInnerHTML: { __html: string };
};

/**
 * 
 * Div responsible for rendering an overlay such as highlighting selections or marking complicated words/sentences.
 */
function OverlayBox ({ sharedStyles, dangerouslySetInnerHTML }: OverlayBoxProps ) {
        return (
            <Box
                    component="div"
                    sx={{
                    ...sharedStyles,
                    width: "100%",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    overflow: "hidden",
                    pointerEvents: "none",
                    whiteSpace: "pre-wrap",
                    overflowWrap: "anywhere",
                    wordBreak: "normal",
                    hyphens: "none",
                    // debugging
                    // color: "rgba(0,0,0,0.2)",
                    // background: "rgba(255,0,0,0.05)",
                    color: "transparent",
                    background: "transparent",         
                    zIndex: 0,
                    }}
                    dangerouslySetInnerHTML={dangerouslySetInnerHTML}
                />
            );
}

export default OverlayBox;