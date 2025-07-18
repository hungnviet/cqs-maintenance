export default function MachineEditPage() {
  return (
    <div>
      <h1>Edit Machine</h1>
      <form>
        <label>
          Machine Name:
          <input type="text" name="name" />
        </label>
        <label>
          Machine Type:
          <select name="type">
            <option value="type1">Type 1</option>
            <option value="type2">Type 2</option>
          </select>
        </label>
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
}