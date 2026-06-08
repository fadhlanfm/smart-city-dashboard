"use client";

import React, { useState, useEffect } from "react";
import { Joyride, STATUS, Step } from "react-joyride";
import { useRouter, usePathname } from "next/navigation";
import { useMapStore } from '@/store/mapStore';

export function GuidedTour() {
  const router = useRouter();
  const pathname = usePathname();
  const { openDetailModal, selectAsset } = useMapStore();
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Only run on client side after mount to avoid hydration mismatch
    const hasCompletedTour = localStorage.getItem("hasCompletedTour");
    if (!hasCompletedTour) {
      setTimeout(() => setRun(true), 500);
    }

    const handleStartTour = () => {
      if (pathname !== '/') {
        router.push('/');
      }
      setStepIndex(0);
      setRun(true);
      localStorage.removeItem("hasCompletedTour");
    };

    const handleModalClosed = () => {
      // If the user was on the form step (index 5) or Add Asset step (index 4)
      // and they close the modal, advance to the table step (index 6).
      setStepIndex((prev) => {
        if (prev === 4 || prev === 5) return 6;
        return prev;
      });
    };

    const handleDetailClosed = () => {
      // If they close the POI detail modal (index 13), we finish the tour or just let them be.
      // We can just end the tour by setting run to false.
      setStepIndex((prev) => {
        if (prev === 13) setRun(false);
        return prev;
      });
    };

    // We can also listen for the modal opening to jump exactly to step 6.
    // AssetTableActions sets isModalOpen(true) when clicking the button, 
    // but joyride doesn't know. We'll rely on the user clicking "Next" after opening it, 
    // or we can auto-advance if we listen to a click event on the button itself.
    // Let's attach a listener to the body to detect clicking the "Add Asset" button.
    const handleBodyClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('#tour-add-asset')) {
        setTimeout(() => setStepIndex(5), 300); // Advance to modal step after it opens
      }
    };

    window.addEventListener("start-tour", handleStartTour);
    window.addEventListener("tour-asset-modal-closed", handleModalClosed);
    window.addEventListener("tour-asset-detail-closed", handleDetailClosed);
    document.addEventListener("click", handleBodyClick);
    
    return () => {
      window.removeEventListener("start-tour", handleStartTour);
      window.removeEventListener("tour-asset-modal-closed", handleModalClosed);
      window.removeEventListener("tour-asset-detail-closed", handleDetailClosed);
      document.removeEventListener("click", handleBodyClick);
    };
  }, [pathname, router]);

  const handleJoyrideCallback = (data: any) => {
    const { action, index, status, type } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      setStepIndex(0);
      localStorage.setItem("hasCompletedTour", "true");
      return;
    }

    // Handle controlled step navigation
    if (type === 'step:after' || type === 'error') {
      // If user clicked Next or Back
      let nextIndex = index + (action === 'prev' ? -1 : 1);
      
      // If we are at step 4 (Add Asset) and user just clicks "Next" without clicking the button,
      // it's fine, we will just point to the invisible modal (which will skip or fail), or skip it.
      // But we set hideOverlay: false so they can click it.
      if (index === 4 && action === 'next') {
        // Assume they didn't click the button but clicked next. 
        // Skip the modal step (5) and go to (6) table.
        nextIndex = 6;
      }
      
      if (index === 7 && action === 'next') {
        // Transition to Map View!
        router.push('/map');
        // Wait for route transition before showing next step
        setTimeout(() => setStepIndex(8), 800);
        return;
      }
      
      if (index === 10 && action === 'next') {
        // Transition to POI Map Popup!
        fetch('/api/assets')
          .then(res => res.json())
          .then(data => {
            const items = data.data || data;
            const firstAsset = Array.isArray(items) && items.length > 0 ? items[0] : null;
            if (firstAsset) {
              selectAsset(firstAsset.id);
            }
            setTimeout(() => setStepIndex(11), 500);
          })
          .catch(() => {
            // If fetch fails, just end the tour
            setRun(false);
          });
        return;
      }

      if (index === 11 && action === 'next') {
        // Transition from POI Map Popup to Full POI Detail Modal
        const state = useMapStore.getState();
        if (state.selectedAssetId) {
          openDetailModal(state.selectedAssetId);
        }
        setTimeout(() => setStepIndex(12), 500);
        return;
      }
      
      setStepIndex(nextIndex);
    }
  };

  const steps: Step[] = [
    {
      target: "body",
      content: (
        <div>
          <h3 className="font-bold text-lg mb-2">Welcome to Smart City Ops! 👋</h3>
          <p>Let's take a quick interactive tour to show you around. We promise it's super easy and will only take a minute!</p>
        </div>
      ),
      placement: "center",
      skipBeacon: true,
    },
    {
      target: "#tour-sidebar",
      content: "This is your steering wheel! 🚗 Use this sidebar to switch between the main Dashboard (where we are now) and the interactive Map View.",
      placement: "right",
    },
    {
      target: "#tour-search",
      content: "Looking for something specific? 🔍 Use this search bar to instantly find any city facility (like a streetlight or park) just by typing its name.",
      placement: "bottom",
    },
    {
      target: "#tour-filters",
      content: "Too much data? No problem! 🎯 Use these filters to narrow things down. For example, you can choose to only see 'Active' 'Parks' in a specific district.",
      placement: "bottom",
    },
    {
      target: "#tour-add-asset",
      content: (
        <div>
          <p className="font-semibold text-primary mb-2">Let's practice! ✨</p>
          <p>Click this <strong>Add Asset</strong> button right now to open the registration form.</p>
          <p className="text-xs text-muted-foreground mt-2">(Don't worry, you won't break anything! Or just click Next to skip)</p>
        </div>
      ),
      placement: "left",
      hideOverlay: false,
    },
    {
      target: "#tour-asset-form",
      content: "Awesome! 📝 Here you can fill out the details and even pick the exact location on the map. Feel free to play around, or just click Cancel to continue our tour.",
      placement: "right",
    },
    {
      target: "#tour-asset-table",
      content: "This is our City's Treasure Chest! 💎 Here you can see a neat list of all the assets (like buildings, cameras, or parks) we manage.",
      placement: "top",
    },
    {
      target: "#tour-row-actions",
      content: (
        <div>
          <p>Need to make a change? ⚙️</p>
          <p className="mt-2 text-sm text-muted-foreground border-l-2 pl-2 italic">
            Click this little menu to <strong>Edit</strong> or <strong>Delete</strong> an asset. We won't do it now, but it's good to know where it hides!
          </p>
          <p className="mt-4 font-bold text-primary">Click Next to travel to the Map View! 🚀</p>
        </div>
      ),
      placement: "left",
    },
    {
      target: "#tour-basemap",
      content: "Welcome to the Map View! 🗺️ Here you can change the background picture of the map. Want it to look like a normal Street map or a Satellite image from space? You decide!",
      placement: "right",
    },
    {
      target: "#tour-layer-controls",
      content: "Think of Layers like clear plastic sheets! 🥞 You can turn the 'Parks' sheet on or off so you only see exactly what you want on the map.",
      placement: "right",
    },
    {
      target: "#tour-spatial-tools",
      content: "This is the magic wand! 🪄 Use these tools to draw a circle or shape on the map, and we'll tell you exactly how many things are inside it. Go ahead and explore!",
      placement: "left",
    },
    {
      target: "#tour-poi-popup",
      content: "Look what happened! 📍 When you click any marker on the map, this handy little pop-up appears to give you a quick summary of the location.",
      placement: "bottom",
    },
    {
      target: "#tour-asset-detail",
      content: "And one last thing! 🎁 If you click 'View Details' from that pop-up, you get this full Asset Detail screen. You can see photos, incident logs, and technical specs here. Thanks for taking the tour!",
      placement: "left",
    },
  ];

  if (!isMounted) return null;

  return (
    <Joyride
      onEvent={handleJoyrideCallback}
      continuous
      run={run}
      stepIndex={stepIndex}
      scrollToFirstStep
      options={{
        primaryColor: "#0f172a",
        zIndex: 10000,
        dismissKeyAction: false,
        overlayClickAction: false,
        buttons: ['skip', 'back', 'close', 'primary']
      }}
      steps={steps}
    />
  );
}
