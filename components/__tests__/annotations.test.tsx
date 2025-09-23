import { render, screen } from "@testing-library/react";
import Annotations, { type Annotation } from "../annotations";

describe("Annotations", () => {
  const mockAnnotations: Annotation[] = [
    {
      type: "file_citation",
      fileId: "file_123",
      filename: "document.pdf",
      index: 0,
      title: "Important Document",
    },
    {
      type: "file_citation",
      fileId: "file_456",
      filename: "report.txt",
      index: 1,
      title: "Monthly Report",
    },
  ];

  it("should render annotations list", () => {
    render(<Annotations annotations={mockAnnotations} />);

    expect(screen.getByText("document.pdf")).toBeInTheDocument();
    expect(screen.getByText("report.txt")).toBeInTheDocument();
  });

  it("should render file citation annotations", () => {
    render(<Annotations annotations={mockAnnotations} />);

    const citations = screen.getAllByText(/\.(pdf|txt)$/);
    expect(citations).toHaveLength(2);
  });

  it("should render URL citation with external link", () => {
    const urlAnnotation: Annotation[] = [
      {
        type: "url_citation",
        url: "https://example.com",
        title: "Example Website",
        index: 0,
      },
    ];

    render(<Annotations annotations={urlAnnotation} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByText("Example Website")).toBeInTheDocument();
  });

  it("should render container file citation with download link", () => {
    const containerAnnotation: Annotation[] = [
      {
        type: "container_file_citation",
        fileId: "file_789",
        containerId: "container_123",
        filename: "data.csv",
        index: 0,
      },
    ];

    render(<Annotations annotations={containerAnnotation} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("download");
    expect(link).toHaveAttribute(
      "href",
      "/api/container_files/content?file_id=file_789&container_id=container_123&filename=data.csv"
    );
    expect(screen.getByText("data.csv")).toBeInTheDocument();
  });

  it("should handle container file citation without container ID", () => {
    const containerAnnotation: Annotation[] = [
      {
        type: "container_file_citation",
        fileId: "file_789",
        filename: "data.csv",
        index: 0,
      },
    ];

    render(<Annotations annotations={containerAnnotation} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute(
      "href",
      "/api/container_files/content?file_id=file_789&filename=data.csv"
    );
  });

  it("should handle container file citation without filename", () => {
    const containerAnnotation: Annotation[] = [
      {
        type: "container_file_citation",
        fileId: "file_789",
        containerId: "container_123",
        index: 0,
      },
    ];

    render(<Annotations annotations={containerAnnotation} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute(
      "href",
      "/api/container_files/content?file_id=file_789&container_id=container_123"
    );
    expect(screen.getByText("file_789")).toBeInTheDocument(); // fallback to fileId
  });

  it("should handle empty annotations array", () => {
    const { container } = render(<Annotations annotations={[]} />);

    expect(container.firstChild).toHaveClass(
      "mr-28 mb-2 ml-4 flex max-w-full gap-2 overflow-x-scroll"
    );
    expect(container.firstChild?.childNodes).toHaveLength(0);
  });

  it("should deduplicate identical annotations", () => {
    const duplicateAnnotations: Annotation[] = [
      {
        type: "file_citation",
        fileId: "file_123",
        filename: "document.pdf",
        index: 0,
      },
      {
        type: "file_citation",
        fileId: "file_123",
        filename: "document.pdf",
        index: 1,
      },
      {
        type: "file_citation",
        fileId: "file_456",
        filename: "report.txt",
        index: 2,
      },
    ];

    render(<Annotations annotations={duplicateAnnotations} />);

    // Should only render unique annotations
    expect(screen.getByText("document.pdf")).toBeInTheDocument();
    expect(screen.getByText("report.txt")).toBeInTheDocument();

    // Should not have duplicates
    const pdfElements = screen.getAllByText("document.pdf");
    expect(pdfElements).toHaveLength(1);
  });

  it("should deduplicate URL citations by URL", () => {
    const duplicateUrlAnnotations: Annotation[] = [
      {
        type: "url_citation",
        url: "https://example.com",
        title: "Example Site",
        index: 0,
      },
      {
        type: "url_citation",
        url: "https://example.com",
        title: "Example Site Duplicate",
        index: 1,
      },
    ];

    render(<Annotations annotations={duplicateUrlAnnotations} />);

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
  });

  it("should handle mixed annotation types", () => {
    const mixedAnnotations: Annotation[] = [
      {
        type: "file_citation",
        fileId: "file_123",
        filename: "document.pdf",
        index: 0,
      },
      {
        type: "url_citation",
        url: "https://example.com",
        title: "Example Website",
        index: 1,
      },
      {
        type: "container_file_citation",
        fileId: "file_789",
        filename: "data.csv",
        index: 2,
      },
    ];

    render(<Annotations annotations={mixedAnnotations} />);

    expect(screen.getByText("document.pdf")).toBeInTheDocument();
    expect(screen.getByText("Example Website")).toBeInTheDocument();
    expect(screen.getByText("data.csv")).toBeInTheDocument();

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3); // file_citation, URL citation and container file citation
  });

  it("should apply correct CSS classes", () => {
    render(<Annotations annotations={mockAnnotations} />);

    const container = screen.getByText("document.pdf").closest("div");
    expect(container).toHaveClass(
      "mr-28",
      "mb-2",
      "ml-4",
      "flex",
      "max-w-full",
      "gap-2",
      "overflow-x-scroll"
    );

    const pillLink = screen.getByText("document.pdf").closest("a");
    expect(pillLink).toHaveClass(
      "inline-block",
      "text-nowrap",
      "px-3",
      "py-1",
      "rounded-full",
      "text-xs",
      "max-w-48",
      "shrink-0",
      "text-ellipsis",
      "overflow-hidden",
      "bg-[#ededed]",
      "text-zinc-500",
      "flex",
      "cursor-pointer",
      "items-center",
      "gap-1",
      "hover:bg-gray-200"
    );
  });

  it("should handle special characters in filename encoding", () => {
    const specialCharAnnotations: Annotation[] = [
      {
        type: "container_file_citation",
        fileId: "file_special",
        filename: "file with spaces & symbols!.pdf",
        index: 0,
      },
    ];

    render(<Annotations annotations={specialCharAnnotations} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute(
      "href",
      expect.stringContaining(
        "filename=file%20with%20spaces%20%26%20symbols!.pdf"
      )
    );
  });

  it("should handle annotations without required fields gracefully", () => {
    const incompleteAnnotations: Annotation[] = [
      {
        type: "file_citation",
        // Missing fileId and filename
        index: 0,
      },
      {
        type: "url_citation",
        // Missing url and title
        index: 1,
      },
    ];

    // Should not throw error
    expect(() => {
      render(<Annotations annotations={incompleteAnnotations} />);
    }).not.toThrow();
  });
});
