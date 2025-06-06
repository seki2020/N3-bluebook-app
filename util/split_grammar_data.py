import json
import os

def split_grammar_data(input_file, output_dir):
    """
    Splits grammar data from a single JSON file into multiple files based on chapter.

    Args:
        input_file (str): Path to the input grammar_data.json file.
        output_dir (str): Directory to save the split JSON files.
    """
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            grammar_data = json.load(f)
    except FileNotFoundError:
        print(f"Error: Input file '{input_file}' not found.")
        return
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from '{input_file}'.")
        return

    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)

    # Group data by chapter
    grouped_data = {}
    for item in grammar_data:
        chapter = item.get('chapter')
        if chapter is not None:
            if chapter not in grouped_data:
                grouped_data[chapter] = []
            grouped_data[chapter].append(item)
        else:
            print(f"Warning: Item without 'chapter' field found: {item}")

    # Write grouped data to separate files
    for chapter, data in grouped_data.items():
        output_filename = os.path.join(output_dir, f"{chapter}.json")
        try:
            with open(output_filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=4)
            print(f"Successfully wrote data for chapter {chapter} to '{output_filename}'")
        except IOError as e:
            print(f"Error writing file '{output_filename}': {e}")

if __name__ == "__main__":
    # Assuming grammar_data.json is in the parent directory of 'util'
    # and the new folder will be 'split_grammar_data' in the parent directory
    current_dir = os.path.dirname(__file__)
    parent_dir = os.path.abspath(os.path.join(current_dir, os.pardir))
    
    input_json_path = os.path.join(parent_dir, 'grammar_data.json')
    output_folder_path = os.path.join(parent_dir, 'split_grammar_data')

    split_grammar_data(input_json_path, output_folder_path)
