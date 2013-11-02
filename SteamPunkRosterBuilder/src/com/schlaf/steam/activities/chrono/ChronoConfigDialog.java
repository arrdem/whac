/**
 * 
 */
package com.schlaf.steam.activities.chrono;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.Dialog;
import android.content.DialogInterface;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.EditText;

import com.actionbarsherlock.app.SherlockDialogFragment;
import com.schlaf.steam.R;
import com.schlaf.steam.activities.chrono.ChronoFragment.ChronoActivityInterface;

/**
 * @author S0085289
 * 
 */
public class ChronoConfigDialog extends SherlockDialogFragment implements
		OnClickListener {

	ChronoActivityInterface listener;

	public Dialog onCreateDialog(Bundle savedInstanceState) {
		Log.d("ChronoConfigDialog", "onCreateDialog");
		// Use the Builder class for convenient dialog construction
		AlertDialog.Builder builder = new AlertDialog.Builder(getActivity());
		builder.setMessage("Choose chronometer initial time");
		builder.setPositiveButton("OK", new DialogInterface.OnClickListener() {
			public void onClick(DialogInterface dialog, int id) {

				String minutes = ((EditText) getDialog().findViewById(
						R.id.inputMinutes)).getText().toString();

				listener.setInitialMinuteCount(Integer.valueOf(minutes));
			}
		});

		builder.setNegativeButton("Cancel",
				new DialogInterface.OnClickListener() {
					public void onClick(DialogInterface dialog, int id) {
						// User cancelled the dialog
					}
				});

		LayoutInflater inflater = getActivity().getLayoutInflater();

		View view = inflater.inflate(R.layout.chrono_dialog_config_fragment,
				null);

		((EditText) view.findViewById(R.id.inputMinutes)).setText("60");
		
		view.findViewById(R.id.button0).setOnClickListener(this);
		view.findViewById(R.id.button1).setOnClickListener(this);
		view.findViewById(R.id.button2).setOnClickListener(this);
		view.findViewById(R.id.button3).setOnClickListener(this);
		view.findViewById(R.id.button4).setOnClickListener(this);
		view.findViewById(R.id.button5).setOnClickListener(this);
		view.findViewById(R.id.button6).setOnClickListener(this);
		view.findViewById(R.id.button7).setOnClickListener(this);
		view.findViewById(R.id.button8).setOnClickListener(this);
		view.findViewById(R.id.button9).setOnClickListener(this);
		view.findViewById(R.id.buttonBackspace).setOnClickListener(this);
		

		builder.setView(view);
		// Create the AlertDialog object and return it
		return builder.create();
	}

	@Override
	public void onAttach(Activity activity) {
		Log.d("ChronoConfigDialog", "onAttach");
		super.onAttach(activity);
		if (activity instanceof ChronoActivityInterface) {
			listener = (ChronoActivityInterface) activity;
		} else {
			throw new ClassCastException(activity.toString()
					+ " must implement BattleListInterface");
		}

	}

	@Override
	public void onClick(View v) {
		// TODO Auto-generated method stub
		EditText editText = ((EditText) getDialog().findViewById(
				R.id.inputMinutes));

		switch (v.getId()) {
		case R.id.button0:
			editText.getText().append('0');
			break;
		case R.id.button1:
			editText.getText().append('1');
			break;
		case R.id.button2:
			editText.getText().append('2');
			break;
		case R.id.button3:
			editText.getText().append('3');
			break;
		case R.id.button4:
			editText.getText().append('4');
			break;
		case R.id.button5:
			editText.getText().append('5');
			break;
		case R.id.button6:
			editText.getText().append('6');
			break;
		case R.id.button7:
			editText.getText().append('7');
			break;
		case R.id.button8:
			editText.getText().append('8');
			break;
		case R.id.button9:
			editText.getText().append('9');
			break;
		case R.id.buttonBackspace:
			String value = editText.getText().toString();
			int editionEnd = editText.getSelectionEnd();
			if (editionEnd > 0) {
				value = value.substring(0, value.length() - 1 );
				editText.setText(value);
			}
			break;
		default:
			break;
		}
		editText.setSelection(editText.getText().length(), editText.getText().length());
	}
}
