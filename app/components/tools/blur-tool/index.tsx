"use client";

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function BlurTool() {
  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Blur Tool</h3>
      <p className="text-sm text-gray-600 mb-4">
        Blur functionality will be implemented here.
      </p>
      <div className="flex gap-2">
        <Button>Apply Blur</Button>
        <Button variant="outline">Cancel</Button>
      </div>
    </Card>
  );
}
