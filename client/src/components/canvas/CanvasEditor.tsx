import React, { useRef, useEffect, useState, useMemo } from "react";
import {
  Stage,
  Layer,
  Rect,
  Transformer,
  Group,
  Line,
  Text,
} from "react-konva";
import { useStore, type CanvasElement } from "../../store/useStore";
import { v4 as uuidv4 } from "uuid";
import {
  metersToPixels,
  pixelsToMeters,
  snapMeters,
  formatMeters,
} from "../../utils/geometry";


const DimensionLabel = ({
  x,
  y,
  rotation,
  text,
  widthPx,
}: {
  x: number;
  y: number;
  rotation: number;
  text: string;
  widthPx: number;
}) => {
  return (
    <Group x={x} y={y} rotation={rotation}>
      <Line points={[0, 0, 0, -20]} stroke="#0f766e" strokeWidth={1} />
      <Line
        points={[widthPx, 0, widthPx, -20]}
        stroke="#0f766e"
        strokeWidth={1}
      />
      <Line points={[0, -10, widthPx, -10]} stroke="#0f766e" strokeWidth={1} />
      <Line points={[5, -13, 0, -10, 5, -7]} stroke="#0f766e" strokeWidth={1} />
      <Line
        points={[widthPx - 5, -13, widthPx, -10, widthPx - 5, -7]}
        stroke="#0f766e"
        strokeWidth={1}
      />

      <Rect x={widthPx / 2 - 30} y={-20} width={60} height={20} fill="white" />
      <Text
        text={text}
        x={widthPx / 2 - 30}
        y={-16}
        width={60}
        align="center"
        fill="#0f766e"
        fontSize={12}
        fontFamily="monospace"
        fontStyle="bold"
      />
    </Group>
  );
};

const ElementShape = ({
  element,
  isSelected,
  onSelect,
  onChange,
  isInteractive,
  children,
  useGroupTransform = false,
}: any) => {
  const { pixelsPerMeter } = useStore();
  const nodeRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const [liveState, setLiveState] = useState<{
    width: number;
    height: number;
    x: number;
    y: number;
    rotation: number;
  } | null>(null);

  const pxW = metersToPixels(element.width, pixelsPerMeter);
  const pxH = metersToPixels(element.height, pixelsPerMeter);
  const pxX = metersToPixels(element.x, pixelsPerMeter);
  const pxY = metersToPixels(element.y, pixelsPerMeter);

  useEffect(() => {
    if (isSelected && trRef.current && nodeRef.current) {
      trRef.current.nodes([nodeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, pxX, pxY, pxW, pxH]); // redraw transformer if size changed externally

  const onTransform = () => {
    const node = nodeRef.current;
    if (!node) return;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    const rawW = pxW * Math.abs(scaleX);
    const rawH = pxH * Math.abs(scaleY);

    const snappedWMeters = Math.max(
      0.05,
      snapMeters(pixelsToMeters(rawW, pixelsPerMeter)),
    );
    const snappedHMeters = Math.max(
      0.05,
      snapMeters(pixelsToMeters(rawH, pixelsPerMeter)),
    );

    const snappedWPx = metersToPixels(snappedWMeters, pixelsPerMeter);
    const snappedHPx = metersToPixels(snappedHMeters, pixelsPerMeter);

    node.scaleX(Math.sign(scaleX) * (snappedWPx / pxW));
    node.scaleY(Math.sign(scaleY) * (snappedHPx / pxH));

    setLiveState({
      width: snappedWMeters,
      height: snappedHMeters,
      x: node.x(),
      y: node.y(),
      rotation: node.rotation(),
    });
  };

  const onTransformEnd = () => {
    const node = nodeRef.current;
    if (!node) return;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);

    const rawW = pxW * Math.abs(scaleX);
    const rawH = pxH * Math.abs(scaleY);
    const snappedWMeters = Math.max(
      0.05,
      snapMeters(pixelsToMeters(rawW, pixelsPerMeter)),
    );
    const snappedHMeters = Math.max(
      0.05,
      snapMeters(pixelsToMeters(rawH, pixelsPerMeter)),
    );

    setLiveState(null);
    onChange({
      x: snapMeters(pixelsToMeters(node.x(), pixelsPerMeter), 0.05),
      y: snapMeters(pixelsToMeters(node.y(), pixelsPerMeter), 0.05),
      width: snappedWMeters,
      height: snappedHMeters,
      rotation: node.rotation(),
    });
  };

  const onDragMove = (e: any) => {
    const node = e.target;
    // snap position to measurement steps
    const xMeters = snapMeters(pixelsToMeters(node.x(), pixelsPerMeter), 0.05);
    const yMeters = snapMeters(pixelsToMeters(node.y(), pixelsPerMeter), 0.05);
    const finalPxX = metersToPixels(xMeters, pixelsPerMeter);
    const finalPxY = metersToPixels(yMeters, pixelsPerMeter);

    node.x(finalPxX);
    node.y(finalPxY);

    setLiveState({
      width: element.width,
      height: element.height,
      x: finalPxX,
      y: finalPxY,
      rotation: element.rotation,
    });
  };

  const onDragEnd = (e: any) => {
    const node = e.target;
    const xMeters = snapMeters(pixelsToMeters(node.x(), pixelsPerMeter), 0.05);
    const yMeters = snapMeters(pixelsToMeters(node.y(), pixelsPerMeter), 0.05);
    setLiveState(null);
    onChange({ x: xMeters, y: yMeters });
  };

  const currentW = liveState?.width ?? element.width;
  const currentH = liveState?.height ?? element.height;
  const currentWPx = metersToPixels(currentW, pixelsPerMeter);
  const currentHPx = metersToPixels(currentH, pixelsPerMeter);

  const currentPxX = liveState?.x ?? pxX;
  const currentPxY = liveState?.y ?? pxY;
  const currentRotation = liveState?.rotation ?? element.rotation;

  const innerProps = {
    x: pxX, // Group or Rect starts at pxX but Konva manages internally during drag/transform
    y: pxY,
    width: pxW,
    height: pxH,
    rotation: element.rotation,
    draggable: isInteractive,
    listening: isInteractive,
    onClick: (e: any) => onSelect(e.evt.shiftKey || e.evt.metaKey),
    onTap: (e: any) => onSelect(e.evt.shiftKey || e.evt.metaKey),
    onTransform,
    onTransformEnd,
    onDragMove,
    onDragEnd,
  };

  return (
    <>
      {useGroupTransform ? (
        <Group ref={nodeRef} {...innerProps}>
          {children(pxW, pxH)}
        </Group>
      ) : (
        React.cloneElement(children(pxW, pxH), { ref: nodeRef, ...innerProps })
      )}

      {(isSelected || liveState) && (
        <Group x={currentPxX} y={currentPxY} rotation={currentRotation}>
          {/* Top Dimension (Width) */}
          <DimensionLabel
            x={0}
            y={-5}
            rotation={0}
            text={formatMeters(currentW)}
            widthPx={currentWPx}
          />
          {/* Right Dimension (Height) */}
          <DimensionLabel
            x={currentWPx + 5}
            y={0}
            rotation={90}
            text={formatMeters(currentH)}
            widthPx={currentHPx}
          />
        </Group>
      )}

      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled={true}
          // rotationSnaps={ROTATION_SNAPS}
          flipEnabled={false}
          ignoreStroke={true}
          anchorSize={8}
          anchorStroke="#3b82f6"
          anchorFill="#fff"
        />
      )}
    </>
  );
};

const DoorOrWindow = (props: any) => {
  return (
    <ElementShape {...props} useGroupTransform={false}>
      {(w: number, h: number) => (
        <Rect
          width={w}
          height={h}
          fill={props.isSelected ? "#e0f2fe" : "#f8fafc"}
          stroke="#0369a1"
          strokeWidth={2}
          strokeScaleEnabled={false}
        />
      )}
    </ElementShape>
  );
};

const Room = (props: any) => {
  return (
    <ElementShape {...props} useGroupTransform={true}>
      {(w: number, h: number) => (
        <>
          <Rect
            x={0}
            y={0}
            width={w}
            height={h}
            fill={
              props.isSelected
                ? "rgba(59, 130, 246, 0.05)"
                : "rgba(248, 250, 252, 0.5)"
            }
            stroke={props.isSelected ? "#3b82f6" : "#cbd5e1"}
            strokeWidth={2}
            strokeScaleEnabled={false}
            dash={[5, 5]}
          />
          <Text
            text={
              props.element.metadata?.label ||
              props.element.type.charAt(0).toUpperCase() +
                props.element.type.slice(1)
            }
            fontSize={12}
            fill="#64748b"
            fontStyle="bold"
            x={10}
            y={10}
          />
        </>
      )}
    </ElementShape>
  );
};

const InfiniteGrid = ({
  stageSize,
  stagePos,
  zoomLevel,
  pixelsPerMeter,
}: any) => {
  const lines = useMemo(() => {
    const gridLines = [];
    const startX = -stagePos.x / zoomLevel;
    const startY = -stagePos.y / zoomLevel;
    const endX = startX + stageSize.width / zoomLevel;
    const endY = startY + stageSize.height / zoomLevel;

    const majorGrid = pixelsPerMeter;
    const minorGrid = pixelsPerMeter * 0.1;

    const pad = majorGrid;
    const xMin = Math.floor((startX - pad) / minorGrid) * minorGrid;
    const xMax = Math.ceil((endX + pad) / minorGrid) * minorGrid;
    const yMin = Math.floor((startY - pad) / minorGrid) * minorGrid;
    const yMax = Math.ceil((endY + pad) / minorGrid) * minorGrid;

    for (let x = xMin; x <= xMax; x += minorGrid) {
      const isMajor =
        Math.abs(x % majorGrid) < 0.01 ||
        Math.abs((x % majorGrid) - majorGrid) < 0.01;
      gridLines.push(
        <Line
          key={`v${x}`}
          points={[x, yMin, x, yMax]}
          stroke={isMajor ? "#cbd5e1" : "#f1f5f9"}
          strokeWidth={isMajor ? 1 : 0.5}
          listening={false}
        />,
      );
    }

    for (let y = yMin; y <= yMax; y += minorGrid) {
      const isMajor =
        Math.abs(y % majorGrid) < 0.01 ||
        Math.abs((y % majorGrid) - majorGrid) < 0.01;
      gridLines.push(
        <Line
          key={`h${y}`}
          points={[xMin, y, xMax, y]}
          stroke={isMajor ? "#cbd5e1" : "#f1f5f9"}
          strokeWidth={isMajor ? 1 : 0.5}
          listening={false}
        />,
      );
    }

    const background = (
      <Rect
        key="bg"
        name="bg"
        x={xMin - 2000}
        y={yMin - 2000}
        width={xMax - xMin + 4000}
        height={yMax - yMin + 4000}
        fill="#f8fafc"
        listening={true}
      />
    );

    return [background, ...gridLines];
  }, [stageSize, stagePos, zoomLevel, pixelsPerMeter]);

  return <Layer>{lines}</Layer>;
};

const CanvasEditor: React.FC<any> = () => {
  const {
    canvasElements,
    addElement,
    updateElement,
    removeElements,
    selectedTool,
    setSelectedTool,
    selectedElementIds,
    setSelectedElementIds,
    zoomLevel,
    setZoomLevel,
    pixelsPerMeter,
  } = useStore();

  const stageRef = useRef<any>(null);
  const layerRef = useRef<any>(null);

  const [stageSize, setStageSize] = useState({
    width: window.innerWidth + 500,
    height: window.innerHeight + 500,
  });
  const [stagePos, setStagePos] = useState({ x: 250, y: 250 });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      )
        return;
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedElementIds.length > 0
      ) {
        removeElements(selectedElementIds);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedElementIds, removeElements]);

  useEffect(() => {
    const handleResize = () => {
      setStageSize({
        width: window.innerWidth + 500,
        height: window.innerHeight + 500,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [dragMode, setDragMode] = useState<"select" | "create" | null>(null);
  const [dragBox, setDragBox] = useState({ x1: 0, y1: 0, x2: 0, y2: 0 });

  const handleMouseDown = (e: any) => {
    const clickedOnEmpty =
      e.target === e.target.getStage() || e.target.name() === "bg";
    if (clickedOnEmpty) {
      const pos = e.target.getStage().getRelativePointerPosition();
      setDragBox({ x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y });

      if (selectedTool === "select") {
        setDragMode("select");
        setSelectedElementIds([]);
      } else if (["room", "door", "window"].includes(selectedTool)) {
        setDragMode("create");
      }
    }
  };

  const [isPanning, setIsPanning] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const onStageMouseDown = (e: any) => {
    if (e.evt.button === 2 || selectedTool === "move") {
      setIsPanning(true);
      lastPos.current = { x: e.evt.clientX, y: e.evt.clientY };
    } else {
      handleMouseDown(e);
    }
  };

  const onStageMouseMove = (e: any) => {
    const stage = e.target.getStage();
    const pos = stage.getRelativePointerPosition();

    if (isPanning) {
      const dx = e.evt.clientX - lastPos.current.x;
      const dy = e.evt.clientY - lastPos.current.y;
      setStagePos((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      lastPos.current = { x: e.evt.clientX, y: e.evt.clientY };
    } else if (dragMode) {
      setDragBox((prev) => ({ ...prev, x2: pos.x, y2: pos.y }));
    }
  };

  const snapToGridPx = (val: number) => {
    const step = metersToPixels(0.05, pixelsPerMeter);
    return Math.round(val / step) * step;
  };

  const onStageMouseUp = () => {
    if (dragMode === "select") {
      const xMin = Math.min(dragBox.x1, dragBox.x2);
      const xMax = Math.max(dragBox.x1, dragBox.x2);
      const yMin = Math.min(dragBox.y1, dragBox.y2);
      const yMax = Math.max(dragBox.y1, dragBox.y2);

      const capturedIds = canvasElements
        .filter((el) => {
          const pxX = metersToPixels(el.x, pixelsPerMeter);
          const pxY = metersToPixels(el.y, pixelsPerMeter);
          const pxW = metersToPixels(el.width, pixelsPerMeter);
          const pxH = metersToPixels(el.height, pixelsPerMeter);
          return (
            pxX + pxW >= xMin && pxX <= xMax && pxY + pxH >= yMin && pxY <= yMax
          );
        })
        .map((el) => el.id);

      setSelectedElementIds(capturedIds);
    } else if (dragMode === "create") {
      const xMin = snapToGridPx(Math.min(dragBox.x1, dragBox.x2));
      const xMax = snapToGridPx(Math.max(dragBox.x1, dragBox.x2));
      const yMin = snapToGridPx(Math.min(dragBox.y1, dragBox.y2));
      const yMax = snapToGridPx(Math.max(dragBox.y1, dragBox.y2));

      let widthPx = xMax - xMin;
      let heightPx = yMax - yMin;

      const minPx = metersToPixels(0.1, pixelsPerMeter);
      if (widthPx >= minPx && heightPx >= minPx) {
        const newElement: CanvasElement = {
          id: uuidv4(),
          type: selectedTool as any,
          x: pixelsToMeters(xMin, pixelsPerMeter),
          y: pixelsToMeters(yMin, pixelsPerMeter),
          width: pixelsToMeters(widthPx, pixelsPerMeter),
          height: pixelsToMeters(heightPx, pixelsPerMeter),
          rotation: 0,
          metadata: {
            label: selectedTool.charAt(0).toUpperCase() + selectedTool.slice(1),
          },
        };
        addElement(newElement);
        setSelectedElementIds([newElement.id]);
        setSelectedTool("select");
      }
    }

    setDragMode(null);
    setIsPanning(false);
  };

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    if (e.evt.ctrlKey) {
      const scaleBy = 1.05;
      const oldScale = stage.scaleX();
      const pointer = stage.getPointerPosition();
      const mousePointTo = {
        x: (pointer.x - stagePos.x) / oldScale,
        y: (pointer.y - stagePos.y) / oldScale,
      };
      const newScale = Math.min(
        20,
        Math.max(
          0.05,
          e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy,
        ),
      );
      setZoomLevel(newScale);
      setStagePos({
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      });
    } else {
      setStagePos((prev) => ({
        x: prev.x - e.evt.deltaX,
        y: prev.y - e.evt.deltaY,
      }));
    }
  };

  const renderSelectionBox = () => {
    if (!dragMode) return null;
    return (
      <Rect
        x={Math.min(dragBox.x1, dragBox.x2)}
        y={Math.min(dragBox.y1, dragBox.y2)}
        width={Math.abs(dragBox.x2 - dragBox.x1)}
        height={Math.abs(dragBox.y2 - dragBox.y1)}
        fill={
          dragMode === "create"
            ? "rgba(59, 130, 246, 0.05)"
            : "rgba(59, 130, 246, 0.1)"
        }
        stroke="#3b82f6"
        strokeWidth={1}
        dash={[4, 4]}
      />
    );
  };

  useEffect(() => {
    if (stageRef.current) {
      (window as any).exportCanvas = () => {
        const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 });
        const link = document.createElement("a");
        link.download = "arxitektur-cad-design.png";
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
    }
    return () => {
      delete (window as any).exportCanvas;
    };
  }, []);

  return (
    <div
      className="w-full h-full bg-slate-50 relative rounded-2xl shadow-2xl border border-slate-200/50 overflow-hidden"
      onContextMenu={(e) => e.preventDefault()}
    >
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        x={stagePos.x}
        y={stagePos.y}
        onMouseDown={onStageMouseDown}
        onMouseMove={onStageMouseMove}
        onMouseUp={onStageMouseUp}
        onMouseLeave={onStageMouseUp}
        onWheel={handleWheel}
        ref={stageRef}
        draggable={false}
        style={{
          cursor: isPanning
            ? "grabbing"
            : ["create", "select"].includes(dragMode!)
              ? "crosshair"
              : "default",
        }}
        scaleX={zoomLevel}
        scaleY={zoomLevel}
      >
        <InfiniteGrid
          stageSize={stageSize}
          stagePos={stagePos}
          zoomLevel={zoomLevel}
          pixelsPerMeter={pixelsPerMeter}
        />
        <Layer ref={layerRef}>
          {canvasElements
            .slice()
            .sort((a, b) =>
              selectedElementIds.includes(a.id)
                ? 1
                : selectedElementIds.includes(b.id)
                  ? -1
                  : 0,
            )
            .map((el) => {
              const isSelected = selectedElementIds.includes(el.id);
              const props = {
                key: el.id,
                element: el,
                isSelected,
                onSelect: (multi: boolean) => {
                  if (multi) {
                    setSelectedElementIds(
                      isSelected
                        ? selectedElementIds.filter((id) => id !== el.id)
                        : [...selectedElementIds, el.id],
                    );
                  } else {
                    setSelectedElementIds([el.id]);
                  }
                },
                onChange: (updates: Partial<CanvasElement>) =>
                  updateElement(el.id, updates),
                stageSize,
                isInteractive: selectedTool === "select",
              };
              if (el.type === "door" || el.type === "window")
                return <DoorOrWindow {...props} />;
              if (el.type === "room") return <Room {...props} />;
              return null;
            })}
          {renderSelectionBox()}
        </Layer>
      </Stage>
    </div>
  );
};

export default CanvasEditor;
