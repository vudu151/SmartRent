import React from "react";
import { Card, CardBody, CardHeader, Typography } from "@material-tailwind/react";

export function Health() {
  const [state, setState] = React.useState({ status: "idle", data: null, error: null });

  React.useEffect(() => {
    let cancelled = false;
    setState({ status: "loading", data: null, error: null });

    fetch("/api/health")
      .then(async (res) => {
        const text = await res.text();
        if (!res.ok) throw new Error(text || `${res.status} ${res.statusText}`);
        return JSON.parse(text);
      })
      .then((data) => {
        if (cancelled) return;
        setState({ status: "success", data, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ status: "error", data: null, error: err instanceof Error ? err.message : String(err) });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mt-12">
      <Card className="border border-blue-gray-100 shadow-sm">
        <CardHeader floated={false} shadow={false} color="transparent" className="m-0 p-6">
          <Typography variant="h6" color="blue-gray">
            Backend Health (BE)
          </Typography>
          <Typography variant="small" className="mt-1 font-normal text-blue-gray-600">
            Trang này gọi API: <span className="font-mono">GET /api/health</span>
          </Typography>
        </CardHeader>
        <CardBody className="pt-0">
          {state.status === "loading" ? (
            <Typography className="text-blue-gray-600">Loading...</Typography>
          ) : state.status === "error" ? (
            <pre className="whitespace-pre-wrap rounded-lg bg-red-50 p-4 text-sm text-red-700">{state.error}</pre>
          ) : (
            <pre className="whitespace-pre-wrap rounded-lg bg-blue-gray-50 p-4 text-sm text-blue-gray-800">
              {JSON.stringify(state.data, null, 2)}
            </pre>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default Health;

