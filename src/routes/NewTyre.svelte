<script>
  import { push } from 'svelte-spa-router';
  import { addTyre } from '../lib/tyres.js';
  import Card from '@smui/card';
  import Textfield from '@smui/textfield';
  import Select, { Option } from '@smui/select';
  import Checkbox from '@smui/checkbox';
  import FormField from '@smui/form-field';
  import Button from '@smui/button';

  let name = '';
  let make = '';
  let type = '';
  let description = '';
  let retired = false;
  let loading = false;
  let error = '';

  const handleSubmit = async () => {
    if (!name.trim() || !make.trim() || !type.trim()) {
      error = 'Please fill in all required fields (Name, Make and Type)';
      return;
    }

    loading = true;
    error = '';

    try {
      await addTyre(name.trim(), make.trim(), type.trim(), description.trim(), retired);
      push('/tyres');
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  };

  const handleCancel = () => {
    push('/tyres');
  };
</script>

<div class="new-tyre">
  <div class="header">
    <h1>Add New Tyre</h1>
  </div>

  {#if error}
    <div class="error">{error}</div>
  {/if}

  <Card style="padding: 2rem;">
    <form on:submit|preventDefault={handleSubmit}>
      <div class="form-group">
        <Textfield
          variant="outlined"
          bind:value={name}
          label="Name *"
          required
          disabled={loading}
          style="width: 100%;"
        />
      </div>

      <div class="form-group">
        <Textfield
          variant="outlined"
          bind:value={make}
          label="Make *"
          required
          disabled={loading}
          style="width: 100%;"
        />
      </div>

      <div class="form-group">
        <Select variant="outlined" bind:value={type} label="Type *" required disabled={loading} style="width: 100%;">
          <Option value="">Select type</Option>
          <Option value="Dry">Dry</Option>
          <Option value="Wet">Wet</Option>
        </Select>
      </div>

      <div class="form-group">
        <Textfield
          variant="outlined"
          bind:value={description}
          label="Description"
          textarea
          disabled={loading}
          style="width: 100%;"
          input$rows={4}
        />
      </div>

      <div class="form-group">
        <FormField>
          <Checkbox bind:checked={retired} disabled={loading} />
          <span slot="label">Retired</span>
        </FormField>
      </div>

      <div class="form-actions">
        <Button type="button" onclick={handleCancel} variant="outlined" disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" variant="raised" disabled={loading} style="background-color: #28a745;">
          {loading ? 'Adding...' : 'Add Tyre'}
        </Button>
      </div>
    </form>
  </Card>
</div>

<style>
  .new-tyre {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem;
  }

  .header {
    margin-bottom: 2rem;
  }

  h1 {
    color: #495057;
    margin: 0;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 2rem;
  }

  .error {
    background-color: #f8d7da;
    color: #721c24;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    border: 1px solid #f5c6cb;
  }

  @media (max-width: 768px) {
    .new-tyre {
      padding: 1rem;
    }

    .form-actions {
      flex-direction: column;
    }
  }
</style>
