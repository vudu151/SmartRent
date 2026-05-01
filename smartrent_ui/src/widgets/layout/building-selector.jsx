import { useEffect, useState, useRef } from "react";
import {
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Typography,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Button,
} from "@material-tailwind/react";
import { BuildingOfficeIcon, ChevronUpDownIcon } from "@heroicons/react/24/solid";
import { useAuth } from "@/smartrent/auth";
import { apiFetch } from "@/lib/http";
import { getTenantId } from "@/api/auth";
import { useMaterialTailwindController } from "@/context";

export function BuildingSelector() {
  const [controller] = useMaterialTailwindController();
  const { darkMode, sidenavType } = controller;
  const { user } = useAuth();
  
  const activeSidenavType = darkMode ? "dark" : sidenavType;
  const isDark = activeSidenavType === "dark";

  const [buildings, setBuildings] = useState([]);
  const [activeBuildingId, setActiveBuildingId] = useState(() => {
    return localStorage.getItem("selectedBuildingId") || null;
  });

  const [openModal, setOpenModal] = useState(false);
  const [newBuilding, setNewBuilding] = useState({ name: "", address: "" });
  const [loading, setLoading] = useState(false);
  const menuTriggerRef = useRef(null);
  const [menuWidth, setMenuWidth] = useState(0);

  // Measure container width on mount and resize
  useEffect(() => {
    const measure = () => {
      if (menuTriggerRef.current) {
        setMenuWidth(menuTriggerRef.current.getBoundingClientRect().width);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const handleOpenModal = () => setOpenModal(!openModal);

  useEffect(() => {
    const tenantId = getTenantId();
    if (tenantId) {
      apiFetch(`/api/buildings?tenantId=${tenantId}`)
        .then((res) => {
          if (res.data && res.data.length > 0) {
            setBuildings(res.data);
            // If no active building, or active building not in list, pick first
            const currentId = localStorage.getItem("selectedBuildingId");
            const isValid = res.data.some(b => String(b.id) === currentId);
            
            if (!isValid) {
              const firstId = String(res.data[0].id);
              setActiveBuildingId(firstId);
              localStorage.setItem("selectedBuildingId", firstId);
              window.dispatchEvent(new Event("storage"));
            }
          }
        })
        .catch(console.error);
    }
  }, [user]);

  const handleSelect = (id) => {
    setActiveBuildingId(String(id));
    localStorage.setItem("selectedBuildingId", String(id));
    // Trigger global storage event so http.ts or other components can react
    window.dispatchEvent(new Event("storage"));
    // Reload the page to reset all data with new building context
    window.location.reload();
  };

  const handleCreateBuilding = async () => {
    if (!newBuilding.name) return;
    const tenantId = getTenantId();
    if (!tenantId) return;

    try {
      setLoading(true);
      const res = await apiFetch(`/api/buildings?tenantId=${tenantId}`, {
        method: "POST",
        body: JSON.stringify({
          name: newBuilding.name,
          address: newBuilding.address,
          electricityPrice: 3500,
          waterPrice: 25000,
          servicePrice: 100000,
          internetPrice: 100000,
          parkingPrice: 120000
        })
      });
      if (res.data) {
        setOpenModal(false);
        handleSelect(res.data.id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const activeBuilding = buildings.find((b) => String(b.id) === String(activeBuildingId)) || buildings[0];

  // if (!buildings.length) return null;

  return (
    <div ref={menuTriggerRef} className={`mx-3 mb-2 px-3 py-2 rounded-lg border ${isDark ? "border-gray-700/50 bg-gray-800/50" : "border-blue-gray-50 bg-blue-gray-50/50"}`}>
      <Typography variant="small" className={`font-medium mb-1 text-[10px] uppercase tracking-wider ${isDark ? "text-gray-400" : "text-gray-500"}`}>
        Khu Trọ Đang Chọn
      </Typography>
      <Menu placement="bottom-start">
        <MenuHandler>
          <button className={`flex items-center justify-between w-full p-1.5 rounded-md transition-colors ${isDark ? "hover:bg-gray-700/50" : "hover:bg-white"}`}>
            <div className="flex items-center gap-2 overflow-hidden">
              <div className={`p-1 rounded-md ${isDark ? "bg-gray-700" : "bg-white shadow-sm"}`}>
                <BuildingOfficeIcon className={`h-4 w-4 ${isDark ? "text-indigo-300" : "text-indigo-500"}`} />
              </div>
              <Typography variant="small" className={`font-semibold truncate ${isDark ? "text-white" : "text-blue-gray-800"}`}>
                {activeBuilding?.name || "Chưa có khu trọ"}
              </Typography>
            </div>
            <ChevronUpDownIcon className={`h-4 w-4 shrink-0 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
          </button>
        </MenuHandler>
        <MenuList className={`p-1 border-0 shadow-lg ${isDark ? "bg-gray-800 text-white shadow-black/50" : ""}`} style={menuWidth > 0 ? { width: `${menuWidth}px`, minWidth: `${menuWidth}px`, maxWidth: `${menuWidth}px` } : {}}>
          {buildings.length > 0 ? buildings.map((b) => (
            <MenuItem 
              key={b.id} 
              onClick={() => handleSelect(b.id)}
              className={`flex items-center gap-2 mb-1 last:mb-0 ${String(b.id) === String(activeBuildingId) ? (isDark ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-50 text-indigo-500") : ""}`}
            >
              <BuildingOfficeIcon className="h-4 w-4" />
              <div className="flex flex-col">
                <Typography variant="small" className="font-medium">
                  {b.name}
                </Typography>
                {b.address && (
                  <Typography variant="small" className={`text-[10px] opacity-70`}>
                    {b.address.length > 20 ? b.address.substring(0, 20) + "..." : b.address}
                  </Typography>
                )}
              </div>
            </MenuItem>
          )) : (
            <div className="px-3 py-2 text-center">
              <Typography variant="small" className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Bạn chưa tạo Khu trọ nào.
              </Typography>
            </div>
          )}
          <div className={`my-1 border-t ${isDark ? "border-gray-700" : "border-gray-100"}`}></div>
          <MenuItem onClick={handleOpenModal} className={`flex items-center justify-center gap-2 py-2 ${isDark ? "text-indigo-300" : "text-indigo-500 font-medium"}`}>
            + Thêm khu trọ mới
          </MenuItem>
        </MenuList>
      </Menu>

      <Dialog open={openModal} handler={handleOpenModal} size="sm" className={`min-w-[95vw] sm:min-w-[60vw] md:min-w-[40vw] ${isDark ? "bg-gray-800 text-white" : ""}`}>
        <DialogHeader>Thêm Khu Trọ Mới</DialogHeader>
        <DialogBody divider className="flex flex-col gap-4">
          <Input 
            label="Tên Khu Trọ" 
            value={newBuilding.name}
            onChange={(e) => setNewBuilding({...newBuilding, name: e.target.value})}
            color={isDark ? "white" : "indigo"}
          />
          <Input 
            label="Địa chỉ (Tùy chọn)" 
            value={newBuilding.address}
            onChange={(e) => setNewBuilding({...newBuilding, address: e.target.value})}
            color={isDark ? "white" : "indigo"}
          />
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={handleOpenModal} className="mr-1">
            Hủy
          </Button>
          <Button variant="gradient" color="indigo" onClick={handleCreateBuilding} disabled={!newBuilding.name || loading}>
            {loading ? "Đang tạo..." : "Xác Nhận Tạo"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
