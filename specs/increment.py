import re

def increment_spec_numbers(filepath, number):
    with open(filepath, 'r+') as file:
        content = file.read()
        lines = content.splitlines()

        # Find the line containing the given number
        for i, line in enumerate(lines):
            match = re.search(rf'(\bBWAL-){number}\b', line)
            if match:
                start_index = match.start()
                break
        else:
            print(f"Number {number} not found in the file.")
            return

        # Increment the numbers from the given number onwards
        for i in range(i, len(lines)):
            line = lines[i]
            matches = re.findall(r'(\bBWAL-)(\d{3})\b', line)
            for prefix, next_number in matches:
                if next_number >= number:
                    incremented_number = str(int(next_number) + 1).zfill(3)
                    line = line.replace(f'{prefix}{next_number}', f'{prefix}{incremented_number}')
            lines[i] = line

        file.seek(0)
        file.write('\n'.join(lines))
        file.truncate()

    print(f"Numbers starting from {number} have been incremented.")


# Example usage
filepath = './user-interface/1101-BWAL-browser_wallet.md'
number = '060'
increment_spec_numbers(filepath, number)
