import React from "react";
import { render, fireEvent, within, wait } from "react-testing-library";
import TodoApp from "./TodoApp";

describe("TodoApp", () => {
  it("should render correctly", () => {
    const { getByText } = render(<TodoApp />);
    expect(getByText(/TodoList/)).toBeVisible();
  });

  it("should display an input with label Todo", () => {
    const { getByLabelText } = render(<TodoApp />);
    expect(getByLabelText("Todo")).toBeVisible();
  });

  it("should contain an input with a placeholder", () => {
    const { getByPlaceholderText } = render(<TodoApp />);
    expect(getByPlaceholderText("Type here")).toBeVisible();
  });

  it("should display a button to add the todo", () => {
    const { getByText } = render(<TodoApp />);
    expect(getByText("Add", { selector: "button" })).toBeVisible();
  });

  it("should contain a zone to display todos", () => {
    const { queryByTestId } = render(<TodoApp />);
    expect(queryByTestId("todo-list")).toBeInTheDocument();
  });

  it("should update input value when we type", () => {
    const { getByLabelText } = render(<TodoApp />);
    fireEvent.change(getByLabelText("Todo"), {
      target: { value: "Write tests" }
    });
    expect(getByLabelText("Todo").value).toEqual("Write tests");
  });

  it("should add current value in todo-list", () => {
    const { getByLabelText, getByText, getByTestId } = render(<TodoApp />);
    fireEvent.change(getByLabelText("Todo"), {
      target: { value: "Write tests" }
    });
    fireEvent.click(getByText("Add"));
    const todoList = getByTestId("todo-list");
    expect(within(todoList).getByText("Write tests")).toBeVisible();
  });

  it("should disable button when no data is entered", () => {
    const { getByText } = render(<TodoApp />);
    expect(getByText("Add")).toBeDisabled();
  });

  it("should disable button when empty (only spaces) data is entered", () => {
    const { getByText, getByLabelText } = render(<TodoApp />);
    fireEvent.change(getByLabelText("Todo"), {
      target: { value: "        " }
    });
    expect(getByText("Add")).toBeDisabled();
  });

  it("should render without warnings when same todo is entered", () => {
    jest.spyOn(console, "error");
    const { getByLabelText, getByText } = render(<TodoApp />);
    fireEvent.change(getByLabelText("Todo"), {
      target: { value: "Write tests" }
    });
    fireEvent.click(getByText("Add"));
    fireEvent.change(getByLabelText("Todo"), {
      target: { value: "Write tests" }
    });
    fireEvent.click(getByText("Add"));
    expect(console.error).not.toBeCalled();
  });

  it("should clear input when add button is clicked", () => {
    const { getByLabelText, getByText } = render(<TodoApp />);
    fireEvent.change(getByLabelText("Todo"), {
      target: { value: "Write tests" }
    });
    fireEvent.click(getByText("Add"));
    expect(getByLabelText("Todo").value).toEqual("");
  });

  it("should send data to the server", () => {
    global.fetch = jest.fn().mockResolvedValue({ value: "ok" });

    const { getByLabelText, getByText } = render(<TodoApp />);
    fireEvent.change(getByLabelText("Todo"), {
      target: { value: "Write tests" }
    });
    fireEvent.click(getByText("Add"));
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith("http://localhost:8000/todo", {
      method: "PUT",
      data: JSON.stringify({ todo: "Write tests" })
    });
  });

  it("should handle errors", async () => {
    global.fetch = jest.fn().mockRejectedValue({ value: "ko" });

    const { getByLabelText, getByText } = render(<TodoApp />);
    fireEvent.change(getByLabelText("Todo"), {
      target: { value: "Write tests" }
    });
    fireEvent.click(getByText("Add"));
    await wait(() => getByText("Oups"));
    expect(getByText("Oups")).toBeVisible();
  });
});
