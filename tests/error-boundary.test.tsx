import React from "react";
import { render, screen } from "@testing-library/react";
import ErrorBoundary from "../components/ErrorBoundary";

function ProblemChild(): JSX.Element {
  throw new Error("boom");
}

describe("ErrorBoundary", () => {
  it("renders children when nothing throws", () => {
    render(
      <ErrorBoundary fallback={<div>Fallback</div>}>
        <div>Healthy child</div>
      </ErrorBoundary>
    );

    expect(screen.getByText("Healthy child")).toBeInTheDocument();
  });

  it("renders the fallback when a child throws", () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary fallback={<div>Fallback</div>}>
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(screen.getByText("Fallback")).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });
});
