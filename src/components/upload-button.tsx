import { useRef, useState } from "react";
import SubmitButton from "./submit-button";
import { Input } from "./ui/input";
import { UseFieldArrayAppend } from "react-hook-form";

export const UploadButton = ({
  append,
}: {
  append: UseFieldArrayAppend<any, "images">;
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      throw new Error("Select a file");
      return;
    }
    const formData = new FormData();
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i] as File;
        formData.append("image", file);
      }
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/upload/image`,
        {
          method: "POST",
          body: formData,
        },
      );
      console.log(response);
      if (!response.ok) {
        setIsLoading(false);
        throw new Error(`Failed to upload image ${response.status}`);
      }
      const result = (await response.json()) as {
        url: string;
        status: string;
        time: number;
      };
      setIsLoading(false);
      append({ url: result.url });
      return result.url;
    }
  };
  return (
    <div>
      <SubmitButton
        type="button"
        isPending={isLoading}
        onClick={() => {
          fileRef.current?.click();
        }}
      >
        <Input
          type="file"
          className="hidden"
          ref={fileRef}
          onChange={handleFileChange}
        />
        UploadImage
      </SubmitButton>
    </div>
  );
};
