"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, FileImage, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';

import { ExtendedAsset } from '@/lib/types';

interface AssetDocsTabProps {
  asset: ExtendedAsset;
}

export function AssetDocsTab({ asset }: AssetDocsTabProps) {
  const photos = asset.photos || [];
  const documents = asset.documents || [];

  const handleDownload = (doc: { title: string }) => {
    const pdf = new jsPDF();
    pdf.setFontSize(20);
    pdf.text("Smart City Asset Document", 20, 20);
    
    pdf.setFontSize(14);
    pdf.text(`Asset Name: ${asset.name}`, 20, 40);
    pdf.text(`Asset ID: ${asset.id}`, 20, 50);
    pdf.text(`District: ${asset.district?.name || 'N/A'}`, 20, 60);
    
    pdf.line(20, 70, 190, 70);
    
    pdf.setFontSize(16);
    pdf.text(`Document: ${doc.title}`, 20, 85);
    
    pdf.setFontSize(12);
    pdf.text(`Date Generated: ${new Date().toLocaleDateString()}`, 20, 100);
    pdf.text(`Document Note: This is an automatically generated system report`, 20, 110);
    pdf.text(`for asset verification and maintenance tracking purposes.`, 20, 117);
    
    pdf.text(`System Status: Operational`, 20, 130);
    pdf.text(`Recent Incidents Recorded: ${asset.recentIncidents?.length || 0}`, 20, 140);
    
    pdf.save(`Asset_Report_${asset.id}.pdf`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileImage className="h-5 w-5" />
            Photo Gallery
          </CardTitle>
          <CardDescription>
            Images and visual documentation associated with this asset.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {photos.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No photos available for this asset.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((photo: { url: string, caption?: string } | string, idx: number) => {
                const url = typeof photo === 'string' ? photo : photo.url;
                const caption = typeof photo === 'string' ? '' : photo.caption;
                return (
                <div key={idx} className="group relative rounded-md overflow-hidden border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={url} 
                    alt={caption || `Photo ${idx+1}`} 
                    className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 transform translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                    <p className="text-xs text-white truncate" title={caption}>
                      {caption || 'No caption'}
                    </p>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Linked Documentation
          </CardTitle>
          <CardDescription>
            Manuals, diagrams, and operational documents.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No documents attached.</p>
          ) : (
            <div className="space-y-3">
              {documents.map((doc: { title: string, url: string, fileType?: string, uploadedAt: string }, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg bg-card/50">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="bg-primary/10 p-2 rounded text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{doc.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px] h-4 leading-3">
                          {doc.fileType || 'PDF'}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(doc.uploadedAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0" title="Generate PDF Report" onClick={() => handleDownload(doc)}>
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
