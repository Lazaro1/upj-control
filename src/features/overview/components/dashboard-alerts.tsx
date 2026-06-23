import { IconAlertTriangle } from '@tabler/icons-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface DashboardAlert {
  type: 'warning' | 'danger';
  title: string;
  description: string;
}

export default function DashboardAlerts({ alerts }: { alerts: DashboardAlert[] }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className='flex flex-col gap-3'>
      {alerts.map((alert, index) => (
        <Alert
          key={index}
          variant={alert.type === 'danger' ? 'destructive' : 'default'}
          className={
            alert.type === 'warning'
              ? 'border-amber-200 bg-amber-50 text-amber-900'
              : undefined
          }
        >
          <IconAlertTriangle className='h-4 w-4' />
          <AlertTitle className='font-semibold'>{alert.title}</AlertTitle>
          <AlertDescription>{alert.description}</AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
