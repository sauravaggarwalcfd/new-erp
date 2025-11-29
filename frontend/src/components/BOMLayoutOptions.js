import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";

export default function BOMLayoutOptions() {
  const [accordionOpen, setAccordionOpen] = useState({ fabric: true, trims: false, operations: false });
  const [verticalSection, setVerticalSection] = useState("fabric");

  return (
    <div className="p-8 space-y-12 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">BOM Interface Options</h1>
        <p className="text-slate-600 mb-8">Choose the best layout for FABRIC, TRIMS, and OPERATIONS ROUTING sections</p>

        {/* OPTION 1: TABS */}
        <Card className="mb-12 border-4 border-blue-500">
          <CardHeader className="bg-blue-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-blue-700">OPTION 1: Horizontal Tabs ✅ RECOMMENDED</CardTitle>
                <p className="text-sm text-slate-600 mt-2">Click tabs to switch between sections. Clean & organized.</p>
              </div>
              <div className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold">BEST FOR CLARITY</div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="fabric" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 h-14">
                <TabsTrigger value="fabric" className="text-lg font-semibold">
                  📦 FABRIC
                </TabsTrigger>
                <TabsTrigger value="trims" className="text-lg font-semibold">
                  ✂️ TRIMS
                </TabsTrigger>
                <TabsTrigger value="operations" className="text-lg font-semibold">
                  ⚙️ OPERATIONS ROUTING
                </TabsTrigger>
              </TabsList>

              <TabsContent value="fabric">
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 bg-blue-50">
                  <h3 className="text-xl font-bold mb-4">FABRIC Section</h3>
                  <p className="text-slate-600 mb-4">Your current multi-table BOM form will be here</p>
                  <div className="bg-white p-6 rounded-lg border">
                    <div className="space-y-2">
                      <div className="flex gap-4 text-sm font-semibold">
                        <div className="w-12">SR NO</div>
                        <div className="flex-1">COMBO NAME</div>
                        <div className="w-32">COLOUR</div>
                        <div className="w-40">FABRIC QUALITY</div>
                        <div className="w-24">GSM</div>
                      </div>
                      <div className="flex gap-4 text-sm border-t pt-2">
                        <div className="w-12">1</div>
                        <div className="flex-1">Main Body Fabric</div>
                        <div className="w-32">Ivory</div>
                        <div className="w-40">Cotton 100%</div>
                        <div className="w-24">180</div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="trims">
                <div className="border-2 border-dashed border-purple-300 rounded-lg p-8 bg-purple-50">
                  <h3 className="text-xl font-bold mb-4">TRIMS Section</h3>
                  <p className="text-slate-600">New section for trim materials (buttons, zippers, labels, etc.)</p>
                </div>
              </TabsContent>

              <TabsContent value="operations">
                <div className="border-2 border-dashed border-green-300 rounded-lg p-8 bg-green-50">
                  <h3 className="text-xl font-bold mb-4">OPERATIONS ROUTING Section</h3>
                  <p className="text-slate-600">New section for operation sequences (cutting, sewing, finishing, etc.)</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* OPTION 2: ACCORDION */}
        <Card className="mb-12 border-4 border-purple-500">
          <CardHeader className="bg-purple-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-purple-700">OPTION 2: Accordion Sections</CardTitle>
                <p className="text-sm text-slate-600 mt-2">Expand/collapse sections. View multiple sections at once.</p>
              </div>
              <div className="px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold">BEST FOR OVERVIEW</div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {/* FABRIC Accordion */}
            <div className="border rounded-lg overflow-hidden">
              <button
                onClick={() => setAccordionOpen({ ...accordionOpen, fabric: !accordionOpen.fabric })}
                className="w-full flex items-center justify-between p-4 bg-blue-100 hover:bg-blue-200 font-semibold text-lg"
              >
                <span>📦 FABRIC SECTION</span>
                {accordionOpen.fabric ? <ChevronDown className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
              </button>
              {accordionOpen.fabric && (
                <div className="p-6 bg-white border-t">
                  <p className="text-slate-600 mb-4">Your current multi-table BOM form</p>
                  <div className="bg-blue-50 p-4 rounded border-2 border-blue-200">
                    <div className="text-sm">BOM Table 1, BOM Table 2, etc...</div>
                  </div>
                </div>
              )}
            </div>

            {/* TRIMS Accordion */}
            <div className="border rounded-lg overflow-hidden">
              <button
                onClick={() => setAccordionOpen({ ...accordionOpen, trims: !accordionOpen.trims })}
                className="w-full flex items-center justify-between p-4 bg-purple-100 hover:bg-purple-200 font-semibold text-lg"
              >
                <span>✂️ TRIMS SECTION</span>
                {accordionOpen.trims ? <ChevronDown className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
              </button>
              {accordionOpen.trims && (
                <div className="p-6 bg-white border-t">
                  <p className="text-slate-600">Trims table (buttons, zippers, labels, etc.)</p>
                </div>
              )}
            </div>

            {/* OPERATIONS Accordion */}
            <div className="border rounded-lg overflow-hidden">
              <button
                onClick={() => setAccordionOpen({ ...accordionOpen, operations: !accordionOpen.operations })}
                className="w-full flex items-center justify-between p-4 bg-green-100 hover:bg-green-200 font-semibold text-lg"
              >
                <span>⚙️ OPERATIONS ROUTING SECTION</span>
                {accordionOpen.operations ? <ChevronDown className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
              </button>
              {accordionOpen.operations && (
                <div className="p-6 bg-white border-t">
                  <p className="text-slate-600">Operations sequence table</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* OPTION 3: VERTICAL NAVIGATION */}
        <Card className="mb-12 border-4 border-green-500">
          <CardHeader className="bg-green-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-green-700">OPTION 3: Vertical Sidebar Navigation</CardTitle>
                <p className="text-sm text-slate-600 mt-2">Left sidebar with step-by-step navigation. Progress tracking.</p>
              </div>
              <div className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold">BEST FOR WORKFLOW</div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex gap-6">
              {/* Left Sidebar */}
              <div className="w-64 space-y-2">
                <Button
                  onClick={() => setVerticalSection("fabric")}
                  variant={verticalSection === "fabric" ? "default" : "outline"}
                  className={`w-full justify-start text-left h-auto py-4 ${
                    verticalSection === "fabric" ? "bg-blue-600" : ""
                  }`}
                >
                  <div>
                    <div className="font-semibold text-base">1. 📦 FABRIC</div>
                    <div className="text-xs opacity-80">Main fabric details</div>
                  </div>
                </Button>

                <Button
                  onClick={() => setVerticalSection("trims")}
                  variant={verticalSection === "trims" ? "default" : "outline"}
                  className={`w-full justify-start text-left h-auto py-4 ${
                    verticalSection === "trims" ? "bg-purple-600" : ""
                  }`}
                >
                  <div>
                    <div className="font-semibold text-base">2. ✂️ TRIMS</div>
                    <div className="text-xs opacity-80">Buttons, zippers, labels</div>
                  </div>
                </Button>

                <Button
                  onClick={() => setVerticalSection("operations")}
                  variant={verticalSection === "operations" ? "default" : "outline"}
                  className={`w-full justify-start text-left h-auto py-4 ${
                    verticalSection === "operations" ? "bg-green-600" : ""
                  }`}
                >
                  <div>
                    <div className="font-semibold text-base">3. ⚙️ OPERATIONS</div>
                    <div className="text-xs opacity-80">Routing & sequences</div>
                  </div>
                </Button>
              </div>

              {/* Right Content Area */}
              <div className="flex-1 border-2 rounded-lg p-6">
                {verticalSection === "fabric" && (
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-xl font-bold mb-4">FABRIC Section Content</h3>
                    <p className="text-slate-600">Your current multi-table BOM form displays here</p>
                  </div>
                )}
                {verticalSection === "trims" && (
                  <div className="bg-purple-50 p-6 rounded-lg">
                    <h3 className="text-xl font-bold mb-4">TRIMS Section Content</h3>
                    <p className="text-slate-600">Trims table displays here</p>
                  </div>
                )}
                {verticalSection === "operations" && (
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="text-xl font-bold mb-4">OPERATIONS ROUTING Content</h3>
                    <p className="text-slate-600">Operations table displays here</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comparison Summary */}
        <Card className="bg-slate-100">
          <CardHeader>
            <CardTitle className="text-2xl">Quick Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-bold text-blue-600 mb-2">OPTION 1: Tabs</h4>
                <ul className="text-sm space-y-1">
                  <li>✅ Clean interface</li>
                  <li>✅ Easy navigation</li>
                  <li>✅ Less scrolling</li>
                  <li>❌ View one section at a time</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-bold text-purple-600 mb-2">OPTION 2: Accordion</h4>
                <ul className="text-sm space-y-1">
                  <li>✅ See all sections</li>
                  <li>✅ Quick expand/collapse</li>
                  <li>❌ More scrolling needed</li>
                  <li>❌ Can get cluttered</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-bold text-green-600 mb-2">OPTION 3: Sidebar</h4>
                <ul className="text-sm space-y-1">
                  <li>✅ Step-by-step flow</li>
                  <li>✅ Progress tracking</li>
                  <li>❌ Less horizontal space</li>
                  <li>❌ More complex UI</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
