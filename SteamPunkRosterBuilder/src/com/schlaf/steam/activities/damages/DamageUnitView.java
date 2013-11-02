package com.schlaf.steam.activities.damages;

import java.util.ArrayList;
import java.util.List;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.LinearGradient;
import android.graphics.Paint;
import android.graphics.Rect;
import android.graphics.Paint.Align;
import android.graphics.Shader.TileMode;
import android.graphics.drawable.Drawable;
import android.util.AttributeSet;
import android.util.Log;
import android.view.MotionEvent;

import com.schlaf.steam.R;
import com.schlaf.steam.data.DamageBox;
import com.schlaf.steam.data.DamageGrid;
import com.schlaf.steam.data.MultiPVUnitGrid;

public class DamageUnitView extends DamageBaseView {

	MultiPVUnitGrid grid;
	
	List<Coords> coords = new ArrayList<Coords>();;
	
	private Drawable textureFond;
	
	Paint paint;

	private int hitPoints; // max hitpoints for any model in unit

	private int modelCount; // number of models in unit
	
	private int selectedModelNumber = 3;
	
	private int halfgridDimension = 0;
	
	private ArrayList<Rect> textZones = new ArrayList<Rect>();
	
	/**
	 * association d'une case de dommage à son centre, permet de trouver où l'on
	 * clique
	 * 
	 * @author S0085289
	 * 
	 */
	private class Coords {
		private DamageBox box;
		private int x;
		private int y;

		public Coords(DamageBox box, int x, int y) {
			this.box = box;
			this.x = x;
			this.y = y;
		}

		public int distanceCarreeFrom(int xx, int yy) {
			return ((xx - x) * (xx - x) + (yy - y) * (yy - y));
		}
		

	}	
	
	public DamageUnitView(Context context, AttributeSet attributes) {
		super(context, attributes);
		init(context);
	}

	public DamageUnitView(Context context) {
		super(context);
		init(context);
	}
	
	private void init(Context context) {
		grid = new MultiPVUnitGrid();
		setFocusable(true);
		if (isInEditMode()) {
			ArrayList<ModelDamageLine> damageLines = new ArrayList<ModelDamageLine>();
			ModelDamageLine damageLine1 = new ModelDamageLine(8, 1);
			ModelDamageLine damageLine2 = new ModelDamageLine(8, 2);
			ModelDamageLine damageLine21 = new ModelDamageLine(8, 3);
			ModelDamageLine damageLine22 = new ModelDamageLine(8, 4);
			ModelDamageLine damageLine3 = new ModelDamageLine(8, 5);
//			ModelDamageLine damageLine4 = new ModelDamageLine(5, 0);
//			ModelDamageLine damageLine5 = new ModelDamageLine(5, 5);
//			ModelDamageLine damageLine6 = new ModelDamageLine(5, 0);
			damageLines.add(damageLine1);
			damageLines.add(damageLine2);
			damageLines.add(damageLine21);
			damageLines.add(damageLine22);
			damageLines.add(damageLine3);
//			damageLines.add(damageLine4);
//			damageLines.add(damageLine5);
//			damageLines.add(damageLine6);
			grid.setDamageLines(damageLines);
			recalculateProportions();
			selectedModelNumber = 3;
		} else {
			selectedModelNumber = 0;
		}
		
		
		
		textureFond = context.getResources().getDrawable(R.drawable.texture_beige);
		paint = new Paint();
	}

	

	/**
	 * lorsqu'on touche la vue.
	 */
	@Override
	public boolean onTouchEvent(MotionEvent event) {

		final int action = event.getAction();
		// (1)
		final int evX = (int) event.getX();
		final int evY = (int) event.getY();
		switch (action) {
		case MotionEvent.ACTION_DOWN:
			break;
		case MotionEvent.ACTION_UP:

			int distance = 10000000;
			Coords pointProche = null;

			for (Coords coord : coords) {
				int dist = coord.distanceCarreeFrom(evX, evY);
				if (dist < distance) {
					pointProche = coord;
					distance = dist;
				}
			}

			if (distance < halfgridDimension * halfgridDimension * 3) {
				pointProche.box.flipFlop();
				invalidate();
			} else {
				// change selected model only if not clicking a box...
				int modelNumber = 0;
//				Log.d("DamageUnitView", "testing point " + evX + " - " + evY);
				for (Rect textZone : textZones) {
					if (textZone.contains(evX, evY)) {
//						Log.d("DamageUnitView", "found in zone number " + modelNumber);
						selectedModelNumber = modelNumber;
						grid.notifyBoxChange();
						invalidate();
					}
					modelNumber ++;
				}
			}
			
			break;
		}
		return true; // consume event

	}
	
	
	@Override
	public void onDraw(Canvas canvas) {

		int w = getMeasuredWidth();
		int h = getMeasuredHeight();
		
		paint.setStyle(Paint.Style.FILL);

		int padding = 3;

		int usableWidth = w - (padding * 2);
		int usableHeight = h - (padding * 2);
		
		paint.setAntiAlias(true);

		// make the entire canvas with background
		Rect clipbounds = new Rect(0, 0, w, h);
		textureFond.setBounds(clipbounds);
		if (! isInEditMode()) {
			textureFond.draw(canvas);
		} else {
			paint.setColor(Color.WHITE);
			canvas.drawRect(clipbounds, paint);
		}

		coords.clear();
		
		int yAxis = 0 ;
		int xAxis = 0;

		int colNum = 0;
		int modelNum = 0;
		
		// grid dimension depending on w, h, model count and max hit points...
		paint.setTextAlign(Align.LEFT);
		
		textZones.clear();
		
		halfgridDimension = Math.min(  ((usableWidth / hitPoints) - 3) / 2 , usableHeight / modelCount / 8 ) ; // (((usableHeight+padding)/modelCount) - 3) / 2
		
		for (ModelDamageLine damageLine : grid.getMultiPvDamageLines()) {
			
			if ( damageLine.getBoxes().size() > 18) {
				hitPoints = damageLine.getBoxes().size();	
			}

			yAxis = (usableHeight / modelCount) * (modelNum)  + (usableHeight / modelCount * 3 / 4)  + padding;
			
			int columnOffset = usableWidth - ( hitPoints * ( halfgridDimension * 2 + 3));
					// offset boxes to the right if less boxes that expected hitpoints
			int usableWidthRemaining = usableWidth - columnOffset;
			
			int yAxisText = (usableHeight / modelCount) * (modelNum)  + (usableHeight / modelCount * 1 / 2)  + padding;
			paint.setTextSize(usableHeight / modelCount / 3 - 4 );
			if (modelNum == selectedModelNumber) {
				paint.setColor(COLUMN_BORDER_COLOR);	
			} else {
				paint.setColor(BOX_BORDER_COLOR);
			}
			
			if (isInEditMode()) {
				canvas.drawText("model #" + modelNum, padding + 10 , yAxisText - 5 , paint);
			} else {
				canvas.drawText(damageLine.getModel().getName(), padding + 10 , yAxisText - 5 , paint);
			}
			Rect textZone = new Rect(padding + 10, yAxisText -5 - usableHeight / modelCount / 3 , usableWidth - padding,   yAxis + halfgridDimension + 2);
//			Log.d("DamageUnitView", "creating textZone " + textZone.toShortString());
			textZones.add(textZone);
			
			if (modelNum == selectedModelNumber) {
				// model selected, display visual indication
				
				paint.setShader(new LinearGradient(padding + 1, yAxis - halfgridDimension - 2, usableWidth - padding + 1,
						 yAxis + halfgridDimension + 2 , COLUMN_INNER_COLOR , Color.TRANSPARENT, TileMode.CLAMP));
				
				canvas.drawRect(padding + 1, yAxis - halfgridDimension - 2, usableWidth - padding + 2,
						 yAxis + halfgridDimension + 2, paint);
				
				paint.setColor(COLUMN_BORDER_COLOR);
				paint.setShader(new LinearGradient(padding + 1, yAxis - halfgridDimension - 2, usableWidth - padding + 2,
						 yAxis + halfgridDimension + 2 , COLUMN_BORDER_COLOR , Color.TRANSPARENT, TileMode.CLAMP));
				paint.setStrokeWidth(2);
				paint.setStyle(Paint.Style.STROKE);
				canvas.drawRect(padding + 1, yAxis - halfgridDimension - 2, usableWidth - padding + 2,
						 yAxis + halfgridDimension + 2, paint);

				// restor fill style
				paint.setStrokeWidth(1);
				paint.setShader(null);
				paint.setStyle(Paint.Style.FILL);
			}
			
			
			
			int nbDamagesForLine = damageLine.getBoxes().size();
			
			for (DamageBox box : damageLine.getBoxes()) {

				xAxis = (int)  columnOffset + (usableWidthRemaining / hitPoints * colNum) + (usableWidthRemaining / hitPoints / 2)
						+ padding;
				
				paint.setColor(Color.BLACK); // black border
				canvas.drawRect(xAxis - halfgridDimension, yAxis
						- halfgridDimension, xAxis + halfgridDimension, yAxis
						+ halfgridDimension, paint); // (centerX, centerY, (int)
														// 10 ,paint);
				
				if (box.isCurrentlyChangePending()) {
					if (box.isDamaged() && box.isDamagedPending()) {
						paint.setColor(Color.GRAY); // damaged : gray inside
					} else if (box.isDamaged() && ! box.isDamagedPending()){
						paint.setColor(Color.GREEN);
					} else if (! box.isDamaged() && box.isDamagedPending()) {
						paint.setColor(Color.RED);
					} else {
						paint.setColor(Color.WHITE); // no damaged : white inside
					}
				} else {
					if (box.isDamaged()) {
						paint.setColor(Color.GRAY); // damaged : gray inside
					} else {
						paint.setColor(Color.WHITE); // no damaged : white inside
					}
				}	
				
				canvas.drawRect(xAxis - halfgridDimension + 1, yAxis
						- halfgridDimension + 1, xAxis + halfgridDimension - 1,
						yAxis + halfgridDimension - 1, paint);

				if ((nbDamagesForLine - colNum) % 5 == 0 && colNum != 0) {
					paint.setColor(Color.BLACK); 
					canvas.drawLine(xAxis - halfgridDimension, yAxis
						- halfgridDimension, xAxis + halfgridDimension, yAxis
						+ halfgridDimension, paint);
				}

				coords.add(new Coords(box, xAxis, yAxis));
				colNum ++;
			}
			modelNum ++;
			colNum = 0;
		}


	}

	@Override
	protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
		
		int desiredWidth = 480;
		int desiredHeight = 100; //  * grid.getDamageLines().size();

		desiredHeight = Math.min( modelCount * 72,  desiredWidth);
		
		int widthMode = MeasureSpec.getMode(widthMeasureSpec);
		int widthSize = MeasureSpec.getSize(widthMeasureSpec);
		int heightMode = MeasureSpec.getMode(heightMeasureSpec);
		int heightSize = MeasureSpec.getSize(heightMeasureSpec);

		int width;
		int height;

		// Measure Width
		//Log.d("DamageLineView", "widthMode = "); 
		if (widthMode == MeasureSpec.EXACTLY) {
			// Must be this size
//			Log.d("UnitDamageView", "w EXACTLY" + widthSize);
			width = widthSize;
		} else if (widthMode == MeasureSpec.AT_MOST) {
			// Can't be bigger than...
			width = Math.min(desiredWidth, widthSize);
//			Log.d("UnitDamageView", "w AT_MOST" + width);
		} else {
//			Log.d("UnitDamageView", "w I WHICH");
			// Be whatever you want
			width = desiredWidth;
		}

		// desiredHeight = (int) (width  / desiredAspectRatio);
		
		// Measure Height
		//Log.d("DamageLineView", "heightMode = "); 
		if (heightMode == MeasureSpec.EXACTLY) {
//			Log.d("UnitDamageView", "H EXACTLY" + heightSize);
			// Must be this size
			height = heightSize;
		} else if (heightMode == MeasureSpec.AT_MOST) {
			// Can't be bigger than...
			height = Math.min(desiredHeight, heightSize);
//			Log.d("UnitDamageView", "H AT_MOST" + height);
		} else {
//			Log.d("UnitDamageView", "I WHICH " + desiredHeight);
			// Be whatever you want
			height = desiredHeight; // (int) (width  / desiredAspectRatio);
		}

		// MUST CALL THIS
		setMeasuredDimension(width, height);

	}	
	
	@Override
	public void onChangeDamageStatus(DamageGrid grid) {
		invalidate();
	}

	public MultiPVUnitGrid getGrid() {
		return grid;
	}

	public void setGrid(MultiPVUnitGrid grid) {
		this.grid = grid;
		grid.registerObserver(this);
		recalculateProportions();
	}
	
	private void recalculateProportions() {
		for (ModelDamageLine damageLine : grid.getMultiPvDamageLines()) {
			if (damageLine.getTotalHits() > hitPoints) {
				hitPoints = damageLine.getTotalHits();
			}
		}
		
		modelCount = grid.getMultiPvDamageLines().size();
	}

	public int getSelectedModelNumber() {
		return selectedModelNumber;
	}

	public void setSelectedModelNumber(int selectedModelNumber) {
		if (selectedModelNumber != this.selectedModelNumber) {
			this.selectedModelNumber = selectedModelNumber;
			invalidate();
		}
		
	}


}
