"use client";
import React, { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  PlusCircle,
  Layout,
  Type,
  Image,
  Settings,
  Sun,
  Moon,
  ZoomIn,
  ZoomOut,
  Undo,
  Redo,
  Move,
  Link,
  Navigation,
  Monitor,
  Tablet,
  Smartphone,
  Component,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SortableElement = ({ element, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: element.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
};

const devicePresets = {
  desktop: { width: 1920, height: 1080 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
};

const HeroSection = () => (
  <div className="bg-gray-900 text-white py-20">
    <div className="container mx-auto px-4">
      <h1 className="text-5xl font-bold mb-4">Welcome to Our Website</h1>
      <p className="text-xl mb-8">Discover amazing features and services.</p>
      <Button>Get Started</Button>
    </div>
  </div>
);

const LayoutModal = ({ isOpen, onClose, onSelectLayout }) => {
  const layouts = [
    { name: "Full Width Container", className: "w-full" },
    { name: "Half Width Container", className: "w-1/2" },
    { name: "Third Width Container", className: "w-1/3" },
    { name: "Two-Third Width Container", className: "w-2/3" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select a Layout</DialogTitle>
          <DialogDescription>
            Choose a container layout to add to your page
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          {layouts.map((layout) => (
            <Button
              key={layout.name}
              onClick={() => onSelectLayout(layout)}
              variant="outline"
              className="h-20"
            >
              {layout.name}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};


const WebsiteBuilder = () => {
  const [pages, setPages] = useState([
    { id: "page1", name: "Home", elements: [], height: 1080 },
  ]);
  const [currentPageId, setCurrentPageId] = useState("page1");
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [autoZoom, setAutoZoom] = useState(true);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isLinking, setIsLinking] = useState(false);
  const [linkSource, setLinkSource] = useState(null);
  const [currentDevice, setCurrentDevice] = useState("desktop");
  const [customSize, setCustomSize] = useState({ width: 1920, height: 1080 });
  const [isDragging, setIsDragging] = useState(false);
  const [draggedComponentType, setDraggedComponentType] = useState(null);
  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);
  const [resizingElement, setResizingElement] = useState(null);
  const [resizeStartPosition, setResizeStartPosition] = useState(null);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && autoZoom) {
        const newZoom = calculateZoom();
        setZoom(newZoom);
        setPan({ x: 0, y: 0 });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [currentDevice, customSize, autoZoom]);

  useEffect(() => {
    const deviceSize =
      currentDevice === "custom" ? customSize : devicePresets[currentDevice];
    const newPages = pages.map((page) => ({
      ...page,
      height: deviceSize.height,
    }));
    setPages(newPages);
    if (autoZoom) {
      const newZoom = calculateZoom();
      setZoom(newZoom);
      setPan({ x: 0, y: 0 });
    }
  }, [currentDevice, customSize, autoZoom]);

  const calculateZoom = () => {
    if (!containerRef.current) return 1;
    const containerWidth = containerRef.current.offsetWidth;
    const containerHeight = containerRef.current.offsetHeight;
    const deviceSize =
      currentDevice === "custom" ? customSize : devicePresets[currentDevice];
    const widthRatio = containerWidth / deviceSize.width;
    const heightRatio = containerHeight / deviceSize.height;
    return Math.min(widthRatio, heightRatio, 1) * 0.9;
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addPage = () => {
    const newPageId = `page${pages.length + 1}`;
    const deviceSize =
      currentDevice === "custom" ? customSize : devicePresets[currentDevice];
    const newPages = [
      ...pages,
      {
        id: newPageId,
        name: `Page ${pages.length + 1}`,
        elements: [],
        height: deviceSize.height,
      },
    ];
    setPages(newPages);
    setCurrentPageId(newPageId);
    addToHistory(newPages);
  };

  const updatePageHeight = (pageId, newHeight) => {
    const newPages = pages.map((page) =>
      page.id === pageId ? { ...page, height: newHeight } : page
    );
    setPages(newPages);
    addToHistory(newPages);
  };

  const addElement = (type, position = { x: 0, y: 0 }) => {
    const newElement = {
      type,
      id: Date.now().toString(),
      style: {},
      content: "",
      position,
      size: { width: 200, height: 100 },
    };
    const newPages = pages.map((page) =>
      page.id === currentPageId
        ? { ...page, elements: [...page.elements, newElement] }
        : page
    );
    setPages(newPages);
    setSelectedElement(newElement);
    addToHistory(newPages);
  };

  const updateElementStyle = (pageId, elementId, style) => {
    const newPages = pages.map((page) =>
      page.id === pageId
        ? {
            ...page,
            elements: page.elements.map((el) =>
              el.id === elementId
                ? { ...el, style: { ...el.style, ...style } }
                : el
            ),
          }
        : page
    );
    setPages(newPages);
    addToHistory(newPages);
  };

  const updateElementContent = (pageId, elementId, content) => {
    const newPages = pages.map((page) =>
      page.id === pageId
        ? {
            ...page,
            elements: page.elements.map((el) =>
              el.id === elementId ? { ...el, content } : el
            ),
          }
        : page
    );
    setPages(newPages);
    addToHistory(newPages);
  };

  const updateElementPosition = (pageId, elementId, position) => {
    const newPages = pages.map((page) =>
      page.id === pageId
        ? {
            ...page,
            elements: page.elements.map((el) =>
              el.id === elementId ? { ...el, position } : el
            ),
          }
        : page
    );
    setPages(newPages);
    addToHistory(newPages);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const addToHistory = (newPages) => {
    const newHistory = [...history.slice(0, historyIndex + 1), newPages];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setPages(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setPages(history[historyIndex + 1]);
    }
  };

  const handleDragStart = (event) => {
    setIsDragging(true);
    setDraggedComponentType(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setIsDragging(false);
    setDraggedComponentType(null);

    if (over && over.id === "canvas") {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const position = {
        x: (event.delta.x - canvasRect.left) / zoom,
        y: (event.delta.y - canvasRect.top) / zoom,
      };
      addElement(active.id, position);
    } else if (active.id !== over.id) {
      const currentPage = pages.find((page) => page.id === currentPageId);
      const oldIndex = currentPage.elements.findIndex(
        (item) => item.id === active.id
      );
      const newIndex = currentPage.elements.findIndex(
        (item) => item.id === over.id
      );

      const newElements = arrayMove(currentPage.elements, oldIndex, newIndex);
      const newPages = pages.map((page) =>
        page.id === currentPageId ? { ...page, elements: newElements } : page
      );

      setPages(newPages);
      addToHistory(newPages);
    }
  };

  const handleDeviceChange = (device) => {
    setCurrentDevice(device);
    setPan({ x: 0, y: 0 });
  };

  const handleCustomSizeChange = (dimension, value) => {
    setCustomSize((prev) => ({ ...prev, [dimension]: parseInt(value) || 0 }));
  };

  const renderElement = (element) => {
    const commonProps = {
      style: {
        ...element.style,
        position: "absolute",
        left: `${element.position.x}px`,
        top: `${element.position.y}px`,
        width: `${element.size.width}px`,
        height: `${element.size.height}px`,
      },
      onClick: (e) => {
        e.stopPropagation();
        setSelectedElement(element);
        if (isLinking) {
          if (linkSource) {
            setIsLinking(false);
            setLinkSource(null);
          } else {
            setLinkSource(element);
          }
        }
      },
    };

    switch (element.type) {
      case "text":
        return <p {...commonProps}>{element.content || "Text Element"}</p>;
      case "image":
        return (
          <div
            {...commonProps}
            style={{ ...commonProps.style, background: "#ccc" }}
          >
            Image Placeholder
          </div>
        );
      case "layout":
        return (
          <div
            {...commonProps}
            style={{ ...commonProps.style, border: "1px dashed #ccc" }}
          >
            Layout Container
          </div>
        );
      case "nav":
        return (
          <nav
            {...commonProps}
            style={{ ...commonProps.style, background: "#eee" }}
          >
            Navigation Bar
          </nav>
        );
      case "hero":
        return (
          <div {...commonProps}>
            <HeroSection />
          </div>
        );
      default:
        return null;
    }
  };

  const handleCanvasClick = (e) => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / zoom - pan.x;
      const y = (e.clientY - rect.top) / zoom - pan.y;
      console.log("Clicked at:", x, y);
    }
    setSelectedElement(null);
  };

  const handleWheel = (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const newZoom = zoom * (1 - e.deltaY * 0.01);
      setZoom(Math.min(Math.max(0.1, newZoom), 5));
    } else {
      setPan({
        x: pan.x - e.deltaX / zoom,
        y: pan.y - e.deltaY / zoom,
      });
    }
  };

  return (
    <div className={`flex h-screen ${isDarkMode ? "dark" : ""}`}>
      {/* Left Sidebar */}
      <div className="w-16 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="flex flex-col items-center py-3">
          <div className="mb-4">
            <img
              src="/assets/images/logo.png"
              alt="Logo"
              className="w-10 h-10 bg-transparent"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => addElement("layout")}
          >
            <Layout className="h-6 w-6 dark:text-gray-300" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => addElement("text")}
          >
            <Type className="h-6 w-6 dark:text-gray-300" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => addElement("image")}
          >
            <Image className="h-6 w-6 dark:text-gray-300" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => addElement("nav")}>
            <Navigation className="h-6 w-6 dark:text-gray-300" />
          </Button>
          <Button variant="ghost" size="icon" onClick={addPage}>
            <PlusCircle className="h-6 w-6 dark:text-gray-300" />
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Component className="h-6 w-6 dark:text-gray-300" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Component</SheetTitle>
                <SheetDescription>
                  Drag and drop components onto the canvas
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4">
                <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                  <Button
                    variant="outline"
                    className="w-full mb-2"
                    {...useSortable({ id: "hero" }).listeners}
                    {...useSortable({ id: "hero" }).attributes}
                  >
                    Hero Section
                  </Button>
                </DndContext>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-900">
        {/* Toolbar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={undo}
              disabled={historyIndex <= 0}
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
            >
              <Redo className="h-4 w-4" />
            </Button>
            <select
              value={currentPageId}
              onChange={(e) => setCurrentPageId(e.target.value)}
              className="border rounded px-2 py-1"
            >
              {pages.map((page) => (
                <option key={page.id} value={page.id}>
                  {page.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant={currentDevice === "desktop" ? "default" : "ghost"}
              size="icon"
              onClick={() => handleDeviceChange("desktop")}
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant={currentDevice === "tablet" ? "default" : "ghost"}
              size="icon"
              onClick={() => handleDeviceChange("tablet")}
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button
              variant={currentDevice === "mobile" ? "default" : "ghost"}
              size="icon"
              onClick={() => handleDeviceChange("mobile")}
            >
              <Smartphone className="h-4 w-4" />
            </Button>
            <Button
              variant={currentDevice === "custom" ? "default" : "ghost"}
              size="icon"
              onClick={() => handleDeviceChange("custom")}
            >
              <Settings className="h-4 w-4" />
            </Button>
            {currentDevice === "custom" && (
              <>
                <Input
                  type="number"
                  placeholder="Width"
                  value={customSize.width}
                  onChange={(e) =>
                    handleCustomSizeChange("width", e.target.value)
                  }
                  className="w-20"
                />
                <Input
                  type="number"
                  placeholder="Height"
                  value={customSize.height}
                  onChange={(e) =>
                    handleCustomSizeChange("height", e.target.value)
                  }
                  className="w-20"
                />
              </>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setZoom(zoom * 1.1)}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setZoom(zoom * 0.9)}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPan({ x: 0, y: 0 })}
            >
              <Move className="h-4 w-4" />
            </Button>
            <Button
              variant={isLinking ? "default" : "ghost"}
              size="icon"
              onClick={() => setIsLinking(!isLinking)}
            >
              <Link className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
              <Switch
                checked={isDarkMode}
                onCheckedChange={toggleTheme}
                className="bg-gray-300 dark:bg-gray-600"
              />
              <Moon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div
          className="flex-1 overflow-hidden"
          ref={containerRef}
          onWheel={handleWheel}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                transformOrigin: "center center",
              }}
            >
              <div
                ref={canvasRef}
                id="canvas"
                className="bg-white shadow-lg relative"
                style={{
                  width:
                    currentDevice === "custom"
                      ? `${customSize.width}px`
                      : `${devicePresets[currentDevice].width}px`,
                  height:
                    currentDevice === "custom"
                      ? `${customSize.height}px`
                      : `${devicePresets[currentDevice].height}px`,
                }}
                onClick={handleCanvasClick}
              >
                <SortableContext
                  items={
                    pages.find((page) => page.id === currentPageId)?.elements ||
                    []
                  }
                  strategy={verticalListSortingStrategy}
                >
                  {pages.map((page) => (
                    <div
                      key={page.id}
                      className={`relative ${
                        page.id === currentPageId ? "" : "hidden"
                      }`}
                      style={{
                        width: "100%",
                        height: "100%",
                        border: "1px solid #ccc",
                      }}
                    >
                      {page.elements.map((element) => (
                        <SortableElement key={element.id} element={element}>
                          {renderElement(element)}
                        </SortableElement>
                      ))}
                    </div>
                  ))}
                </SortableContext>
              </div>
            </div>
            <DragOverlay>
              {isDragging && draggedComponentType === "hero" && <HeroSection />}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
        <Tabs defaultValue="style">
          <TabsList className="w-full">
            <TabsTrigger value="style">Style</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="style">
            {selectedElement && (
              <div className="p-4">
                <h3 className="font-bold mb-2">Style Options</h3>
                <div className="space-y-2">
                  <Input
                    placeholder="Color"
                    value={selectedElement.style.color || ""}
                    onChange={(e) =>
                      updateElementStyle(currentPageId, selectedElement.id, {
                        color: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="Background Color"
                    value={selectedElement.style.backgroundColor || ""}
                    onChange={(e) =>
                      updateElementStyle(currentPageId, selectedElement.id, {
                        backgroundColor: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="Font Size"
                    value={selectedElement.style.fontSize || ""}
                    onChange={(e) =>
                      updateElementStyle(currentPageId, selectedElement.id, {
                        fontSize: e.target.value,
                      })
                    }
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Padding
                    </label>
                    <Slider
                      value={[parseInt(selectedElement.style.padding) || 0]}
                      min={0}
                      max={50}
                      step={1}
                      onValueChange={(value) =>
                        updateElementStyle(currentPageId, selectedElement.id, {
                          padding: `${value[0]}px`,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Border Radius
                    </label>
                    <Slider
                      value={[
                        parseInt(selectedElement.style.borderRadius) || 0,
                      ]}
                      min={0}
                      max={50}
                      step={1}
                      onValueChange={(value) =>
                        updateElementStyle(currentPageId, selectedElement.id, {
                          borderRadius: `${value[0]}px`,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          <TabsContent value="settings">
            {selectedElement && (
              <div className="p-4">
                <h3 className="font-bold mb-2">Element Settings</h3>
                {selectedElement.type === "text" && (
                  <Input
                    placeholder="Text Content"
                    value={selectedElement.content}
                    onChange={(e) =>
                      updateElementContent(
                        currentPageId,
                        selectedElement.id,
                        e.target.value
                      )
                    }
                  />
                )}
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Position and Size</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="X"
                      type="number"
                      value={selectedElement.position.x}
                      onChange={(e) =>
                        updateElementPosition(
                          currentPageId,
                          selectedElement.id,
                          {
                            ...selectedElement.position,
                            x: Number(e.target.value),
                          }
                        )
                      }
                    />
                    <Input
                      placeholder="Y"
                      type="number"
                      value={selectedElement.position.y}
                      onChange={(e) =>
                        updateElementPosition(
                          currentPageId,
                          selectedElement.id,
                          {
                            ...selectedElement.position,
                            y: Number(e.target.value),
                          }
                        )
                      }
                    />
                    <Input
                      placeholder="Width"
                      type="number"
                      value={selectedElement.size.width}
                      onChange={(e) => {
                        const newPages = pages.map((page) =>
                          page.id === currentPageId
                            ? {
                                ...page,
                                elements: page.elements.map((el) =>
                                  el.id === selectedElement.id
                                    ? {
                                        ...el,
                                        size: {
                                          ...el.size,
                                          width: Number(e.target.value),
                                        },
                                      }
                                    : el
                                ),
                              }
                            : page
                        );
                        setPages(newPages);
                        addToHistory(newPages);
                      }}
                    />
                    <Input
                      placeholder="Height"
                      type="number"
                      value={selectedElement.size.height}
                      onChange={(e) => {
                        const newPages = pages.map((page) =>
                          page.id === currentPageId
                            ? {
                                ...page,
                                elements: page.elements.map((el) =>
                                  el.id === selectedElement.id
                                    ? {
                                        ...el,
                                        size: {
                                          ...el.size,
                                          height: Number(e.target.value),
                                        },
                                      }
                                    : el
                                ),
                              }
                            : page
                        );
                        setPages(newPages);
                        addToHistory(newPages);
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WebsiteBuilder;