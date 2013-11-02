/**
 * 
 */
package com.schlaf.steam.activities.selectlist;

import java.util.List;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.widget.RadioGroup.OnCheckedChangeListener;
import android.widget.TextView;

import com.schlaf.steam.R;
import com.schlaf.steam.activities.selectlist.selected.SelectedEntry;
import com.schlaf.steam.activities.selectlist.selection.SelectionEntry;

/**
 * @author S0085289
 * 
 */
public class ChooseAttachActivity extends Activity implements OnCheckedChangeListener {

	public static final int CHOOSE_ATTACH_DIALOG = 1085;
	public static final String INTENT_ELEMENT_ID = "element_id";
	public static final String INTENT_ELEMENT_NUMBER = "element_number";

	private String selectionId;

	/** Called when the activity is first created. */
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);

		setTitle("Choose attachment options");
		
		setContentView(R.layout.dialog_choose_attach);

		selectionId = getIntent().getStringExtra(INTENT_ELEMENT_ID);

		SelectionEntry selection = SelectionModelSingleton.getInstance()
				.getSelectionEntryById(selectionId);

		List<SelectedEntry> modelsToAttach = SelectionModelSingleton
				.getInstance().modelsToWhichAttach(selection);

		setTitle("Choose who to attach this element");

		TextView tv = (TextView) findViewById(R.id.textView1);
		tv.setText(selection.getFullLabel());
		
		RadioGroup radiogroup = (RadioGroup) findViewById(R.id.radioGroupAttach);
		RadioGroup.LayoutParams layoutParams = new RadioGroup.LayoutParams(
	                RadioGroup.LayoutParams.WRAP_CONTENT,
	                RadioGroup.LayoutParams.WRAP_CONTENT);
		
		for (SelectedEntry entry : modelsToAttach) {
			RadioButton newRadioButton = new RadioButton(this);
			newRadioButton.setText(entry.toFullString());
			newRadioButton.setId(modelsToAttach.indexOf(entry));
			radiogroup.addView(newRadioButton, layoutParams);
		}
		
		radiogroup.setOnCheckedChangeListener(this);

	}

	@Override
	public void onCheckedChanged(RadioGroup group, int checkedId) {

		int selectedEntry = ((RadioGroup) findViewById(R.id.radioGroupAttach))
				.getCheckedRadioButtonId();

		Intent intent = new Intent();
		intent.putExtra(INTENT_ELEMENT_ID, selectionId);
		intent.putExtra(INTENT_ELEMENT_NUMBER, selectedEntry);

		setResult(RESULT_OK, intent);
		this.finish();

	}

}
