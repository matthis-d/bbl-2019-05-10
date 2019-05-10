import React, { useState } from "react";

function useInput(initialValue) {
  const [value, setValue] = useState(initialValue);
  const onChange = e => {
    setValue(e.target.value);
  };

  return {
    value,
    onChange,
    setValue
  };
}

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const { value, setValue, onChange } = useInput("");
  const [error, setError] = useState("");

  const addTodo = () => {
    setTodos([...todos, value]);
  };

  const submitTodo = async () => {
    addTodo();
    setValue("");
    try {
      await fetch("http://localhost:8000/todo", {
        method: "PUT",
        data: JSON.stringify({ todo: value })
      });
    } catch (err) {
      setError("Oups");
    }
  };

  return (
    <>
      <h1>TodoList</h1>
      <label htmlFor="todo">Todo</label>
      <input
        name="todo"
        id="todo"
        placeholder="Type here"
        value={value}
        onChange={onChange}
      />
      <button onClick={submitTodo} disabled={!value.trim()}>
        Add
      </button>

      <p>{error}</p>

      <ul data-testid="todo-list">
        {todos.map((todo, index) => (
          <li key={`${todo}-${index}`}>{todo}</li>
        ))}
      </ul>
    </>
  );
}

export default TodoApp;
