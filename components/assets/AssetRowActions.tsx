"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AssetFormModal } from './AssetFormModal';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ExtendedAsset } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function AssetRowActions({ asset }: { asset: ExtendedAsset }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/assets/${asset.id}/crud`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete asset');
      
      try {
        const existingStr = localStorage.getItem('mock_new_assets');
        if (existingStr) {
          const existing = JSON.parse(existingStr).filter((a: any) => a.id !== asset.id);
          localStorage.setItem('mock_new_assets', JSON.stringify(existing));
        }
        const deletedStr = localStorage.getItem('mock_deleted_assets') || '[]';
        const deleted = JSON.parse(deletedStr);
        deleted.push(asset.id);
        localStorage.setItem('mock_deleted_assets', JSON.stringify(deleted));
      } catch (e) {}

      toast.success('Asset deleted successfully');
      setIsDeleteDialogOpen(false);
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('An error occurred');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button id="tour-row-actions" variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setIsEditModalOpen(true); }}>
            <Edit className="mr-2 h-4 w-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setIsDeleteDialogOpen(true); }} className="text-red-600" disabled={isDeleting}>
            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />} Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AssetFormModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        asset={asset}
        onSuccess={() => router.refresh()} 
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the asset
              "{asset.name}" and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }} 
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Delete Asset"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
