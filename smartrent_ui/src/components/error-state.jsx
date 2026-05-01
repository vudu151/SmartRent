import React from "react";
import { Typography, Button } from "@material-tailwind/react";

export function ErrorState({ message = "Không thể tải dữ liệu. Vui lòng kiểm tra lại kết nối máy chủ.", onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 h-full text-center min-h-[200px]">
      <Typography color="red" className="mb-4 text-sm md:text-base">
        {message}
      </Typography>
      {onRetry && (
        <Button onClick={onRetry} variant="outlined" color="blue-gray" size="sm">
          THỬ LẠI
        </Button>
      )}
    </div>
  );
}
