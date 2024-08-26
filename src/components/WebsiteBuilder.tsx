// components/WebsiteBuilder.tsx
import React, { useState, useCallback, useRef, useEffect } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { PlusCircle, Layout, Type, Image, Settings, Sun, Moon, ZoomIn, ZoomOut, Undo, Redo, Move, Link, Navigation, Monitor, Tablet, Smartphone, Component } from "lucide-react";
import LeftSidebar from "./LeftSidebar";
import Toolbar from "./Toolbar";
import Canvas from "./Canvas";
import RightSidebar from "./RightSidebar";
import { Page, Element, DeviceType, CustomSize } from "../types";

const WebsiteBuilder: React.FC = () => {
  const [pages, setPages] = useState<Page[]>([
    { id: "page1", name: "Home", elements: [], height: 1080 },
  ]);
  const [currentPageId, setCurrentPageId] = useState<string>("page1");
  const [history, setHistory] = useState<Page[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [autoZoom, setAutoZoom] = useState<boolean>(true);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isLinking, setIsLinking] = useState<boolean>(false);
  const [linkSource, setLinkSource] = useState<Element | null>(null);
  const [currentDevice, setCurrentDevice] = useState<DeviceType>("desktop");
  const [customSize, setCustomSize] = useState<CustomSize>({ width: 1920, height: 1080 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [draggedComponentType, setDraggedComponentType] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ... (rest of the component logic)

  return (
    <div className={`flex h-screen ${isDarkMode ? "dark" : ""}`}>
      <LeftSidebar addElement={addElement} addPage={addPage} />
      <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-900">
        <Toolbar
          currentPageId={currentPageId}
          pages={pages}
          setCurrentPageId={setCurrentPageId}
          undo={undo}
          redo={redo}
          historyIndex={historyIndex}
          history={history}
          currentDevice={currentDevice}
          handleDeviceChange={handleDeviceChange}
          customSize={customSize}
          handleCustomSizeChange={handleCustomSizeChange}
          zoom={zoom}
          setZoom={setZoom}
          setPan={setPan}
          isLinking={isLinking}
          setIsLinking={setIsLinking}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
        />
        <Canvas
          pages={pages}
          currentPageId={currentPageId}
          zoom={zoom}
          pan={pan}
          canvasRef={canvasRef}
          containerRef={containerRef}
          handleWheel={handleWheel}
          handleCanvasClick={handleCanvasClick}
          currentDevice={currentDevice}
          customSize={customSize}
          renderElement={renderElement}
        />
      </div>
      <RightSidebar
        selectedElement={selectedElement}
        updateElementStyle={updateElementStyle}
        updateElementContent={updateElementContent}
        updateElementPosition={updateElementPosition}
        currentPageId={currentPageId}
        pages={pages}
        setPages={setPages}
        addToHistory={addToHistory}
      />
    </div>
  );
};

export default WebsiteBuilder;