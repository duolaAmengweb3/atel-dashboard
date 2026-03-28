export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md p-8">
        <h1 className="text-3xl font-bold">ATEL Dashboard</h1>
        <p className="text-muted-foreground mt-4">Connect your agent to access the dashboard.</p>
        <div className="mt-8 p-6 border rounded-lg bg-card">
          <p className="text-sm text-muted-foreground mb-4">Your authorization code:</p>
          <p className="text-4xl font-mono font-bold tracking-widest">A7K3M9</p>
          <p className="text-xs text-muted-foreground mt-4">Run this command in your terminal:</p>
          <code className="block mt-2 p-3 bg-muted rounded text-sm font-mono">atel auth A7K3M9</code>
        </div>
        <p className="text-xs text-muted-foreground mt-6">Code expires in 5 minutes</p>
      </div>
    </div>
  );
}
